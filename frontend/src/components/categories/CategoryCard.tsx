import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { CategoryCardProps } from "@/constant/categoryData";

export const CategoryCard = ({ category, onEdit, onDelete }:CategoryCardProps) => {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="px-4 py-3 hover:bg-emerald-50/60 transition-colors"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
        {/* Name */}
        <div className="md:col-span-8 min-w-0">
          <p className="font-medium text-emerald-800 truncate">{category.name}</p>
          <p className="text-xs text-emerald-600 md:hidden">ID: {category.id}</p>
        </div>

        {/* ID (desktop) */}
        <div className="hidden md:block md:col-span-2 text-emerald-700 text-sm">
          {category.id}
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex items-center justify-end gap-1">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
              aria-label={`Edit ${category.name}`}
              title="Edit"
            >
              <Pencil size={16} />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
              aria-label={`Delete ${category.name}`}
              title="Delete"
            >
              <Trash2 size={16} />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.li>
  );
};
