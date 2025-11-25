import React, { useState } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"; // 💡 เพิ่ม Chevron icons
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

  const hasDescription = desc.length > 0;
  const isTruncated = desc.length > 140;

  return (
    <motion.div
      layout
      className="
        bg-white rounded-xl overflow-hidden
        border border-amber-100 shadow-sm hover:shadow-md
        transition-all duration-300 flex flex-col
        min-h-[auto]
      "
    >
      {/* 1. Header (มีการปรับให้มีพื้นที่สำหรับ Description Toggle) */}
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
      
      {/* 2. Description Preview (ตำแหน่งใหม่: ใต้ Header) */}
      {hasDescription && (
        <div className="px-4 pt-3 pb-2 text-sm text-gray-700">
            <p className="leading-snug">
                {isExpanded ? desc : truncated}
            </p>
            {/* 💡 ปุ่มสำหรับขยาย/ย่อข้อความ */}
            {isTruncated && (
                <button
                    type="button"
                    onClick={toggleExpand}
                    className="mt-1 text-amber-600 hover:text-amber-800 flex items-center text-xs font-medium"
                    aria-label={isExpanded ? "Collapse description" : "Expand description"}
                >
                    {isExpanded ? 'ย่อข้อความ' : 'อ่านเพิ่มเติม'}
                    {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                </button>
            )}
        </div>
      )}

      {/* 3. Image (ตอนนี้สามารถคลิกได้ทั้งภาพ) */}
      <CardContent 
        className="p-0 m-0 mt-auto cursor-pointer" 
        onClick={onView}
        role="button"
        aria-label="Open sponsor"
      >
        <div
          // ⬇️ ลบทุกอย่างที่เกี่ยวข้องกับ Overlay ข้อความออก
          className="relative w-full aspect-[6/1] bg-slate-100 overflow-hidden group"
        >
          <motion.img
            src={sponsor.logo || "/placeholder.png"}
            alt={sponsor.name || "Sponsor image"}
            className="absolute inset-0 w-full h-full object-cover object-left group-hover:brightness-95 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </CardContent>
    </motion.div>
  );
};