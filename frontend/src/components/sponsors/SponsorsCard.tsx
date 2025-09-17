import React, { useState } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { SponsorCardProps } from "@/constant/sponsorData";

export const SponsorsCard = ({
  sponsor,
  onEdit,
  onDelete,
  onView,
}: SponsorCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded((v) => !v);

  const desc = sponsor.description || "";
  const truncated = desc.length > 140 ? `${desc.slice(0, 140)}…` : desc;

  return (
    <motion.div
      layout
      className="
        bg-white rounded-xl overflow-hidden
        border border-amber-100 shadow-sm hover:shadow-md
        transition-all duration-300 flex flex-col
        min-h-[300px]
      "
    >
      {/* Header */}
      <CardHeader className="px-4 pt-4 pb-3 border-b flex flex-row items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-semibold text-amber-900 leading-tight line-clamp-2">
            {sponsor.name}
          </CardTitle>
          <div className="mt-1 flex items-center gap-2 text-xs text-amber-700">
            {sponsor.category && (
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">
                {sponsor.category}
              </span>
            )}
            {sponsor.time && (
              <span className="truncate text-amber-500">{sponsor.time}</span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
            aria-label="Edit sponsor"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
            aria-label="Delete sponsor"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Image + Message (ชิดล่างของการ์ด) */}
      <CardContent className="p-0 mt-auto">
        <div
          className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden cursor-pointer group"
          onClick={onView}
          role="button"
          aria-label="Open sponsor"
        >
          <motion.img
            src={sponsor.logo || "/placeholder.png"}
            alt={sponsor.name || "Sponsor image"}
            className="absolute inset-0 w-full h-full object-cover group-hover:brightness-95 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          />

          {/* Overlay ข้อความ preview */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className="absolute inset-x-0 bottom-0 text-left bg-gradient-to-t from-black/70 to-transparent p-3"
          >
            <p className="text-white text-sm leading-snug line-clamp-3">
              {isExpanded ? desc : truncated}
            </p>
          </button>
        </div>
      </CardContent>
    </motion.div>
  );
};
