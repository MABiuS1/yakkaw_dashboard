/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { NewsCardProps } from "@/constant/newsData";

function ImageWrapper({ children, href, label }: { children: React.ReactNode; href?: string; label?: string }) {
  const base = "relative w-full h-48 group overflow-hidden rounded-b-lg block";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={base}>
      {children}
    </a>
  ) : (
    <div className={base}>{children}</div>
  );
}

export function NewsCard({ news, onEdit, onDelete }: NewsCardProps) {
  const truncate = (s = "", len: number) => (s.length > len ? `${s.slice(0, len)}...` : s);
  const title = truncate(news.title ?? "", 30);
  const desc = truncate(news.description ?? "", 75);
  const dateText = news.date ? new Date(news.date).toLocaleString() : "";
  const categoryText = news.category?.name ?? "";

  return (
    <motion.div className="bg-white rounded-lg overflow-hidden border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-2">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-medium text-purple-800">
            {title}
            {categoryText && <p className="text-xs text-purple-400 -mt-1">{categoryText}</p>}
            {dateText && <p className="text-xs text-purple-500 mt-2">{dateText}</p>}
          </CardTitle>
        </div>

        <div className="flex gap-1">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={onEdit} className="text-purple-600 hover:text-purple-800 hover:bg-purple-50">
              <Pencil size={16} />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-purple-600 hover:text-purple-800 hover:bg-purple-50">
              <Trash2 size={16} />
            </Button>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-0">
        <ImageWrapper href={news.url} label={`Open article: ${news.title}`}>
          <motion.img
            src={news.image || "/placeholder.png"}
            alt={news.title ?? "news image"}
            className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
            onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white group-hover:underline transition-all duration-300">{desc}</p>
          </div>
        </ImageWrapper>
      </CardContent>
    </motion.div>
  );
}
