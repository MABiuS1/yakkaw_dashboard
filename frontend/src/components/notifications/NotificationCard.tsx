/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { NotificationCardProps } from "@/constant/notificationData";

export const NotificationCard = ({
  notification,
  onEdit,
  onDelete,
  onView,
}: NotificationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  // จำกัดความยาวเพื่อให้การ์ดสูงสม่ำเสมอ
  const shouldTruncate = (notification.message || "").length > 140;
  const truncatedMessage = shouldTruncate
    ? `${notification.message.slice(0, 140)}…`
    : notification.message;

  return (
    <motion.div
      layout
      className="
        bg-white rounded-xl overflow-hidden
        border border-blue-100 shadow-sm hover:shadow-md
        transition-all duration-300 flex flex-col
        min-h-[300px]
      "
    >
      {/* Header: ฟอนต์/สเกลคงที่ */}
      <CardHeader
        className="
          px-4 pt-4 pb-3 border-b
          flex flex-row items-start justify-between gap-3
        "
      >
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-semibold text-blue-900 leading-tight line-clamp-2">
            {notification.title}
          </CardTitle>

          <div className="mt-1 flex items-center gap-2 text-xs text-blue-600">
            {notification.category && (
              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                {notification.category}
              </span>
            )}
            {notification.time && (
              <span className="truncate text-blue-500">{notification.time}</span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            aria-label="Edit notification"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            aria-label="Delete notification"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Media: คุมสัดส่วน 16:9 ให้เท่ากันทุกใบ */}
      <CardContent className="p-0">
        <div
          className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden cursor-pointer group "
          onClick={onView}
          role="button"
          aria-label="Open notification"
        >
          <motion.img
            src={notification.icon || "/placeholder.png"}
            alt={notification.title || "Notification image"}
            className="absolute inset-0 w-full h-full object-cover group-hover:brightness-95 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          />
          {/* Gradient + ข้อความบนภาพ (สั้น พอดี ตรงกันทุกใบ) */}
          <div
            className="
              absolute inset-x-0 bottom-0
              bg-gradient-to-t from-black/70 to-transparent
              p-3
            "
            onClick={toggleExpand}
          >
            <p className="text-white text-sm leading-snug line-clamp-3">
              {isExpanded ? notification.message : truncatedMessage}
            </p>
          </div>
        </div>
      </CardContent>
    </motion.div>
  );
};