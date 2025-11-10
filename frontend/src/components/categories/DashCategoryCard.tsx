import React from "react";
import { motion } from "framer-motion";
import { FolderKanban } from "lucide-react";
import type { Category } from "@/constant/categoryData";

type DashCategoryCardProps = {
  category: Category;
};

const DashCategoryCard: React.FC<DashCategoryCardProps> = ({ category }) => {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/90 px-4 py-3 shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <FolderKanban className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{category.name}</p>
          <p className="text-xs text-slate-500">ID: {category.id}</p>
        </div>
      </div>
      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600">
        Category
      </span>
    </motion.div>
  );
};

export default DashCategoryCard;
