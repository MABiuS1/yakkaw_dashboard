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
      <CardHeader className="px-4 pt-4 pb-3 border-b flex flex-row items-start justify-between gap-3">
  {/* Left: Title + Meta */}
  <div className="flex-1 min-w-0">
    <CardTitle className="text-base font-semibold text-purple-900 leading-tight line-clamp-2">
      {title}
    </CardTitle>

    <div className="mt-1 flex items-center gap-2 text-xs text-purple-700">
      {categoryText && (
        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800">
          {categoryText}
        </span>
      )}
      {dateText && <span className="truncate text-purple-500">{dateText}</span>}
    </div>
  </div>

  {/* Right: Actions */}
  <div className="shrink-0 flex items-center gap-1">
    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
        aria-label="Edit news"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </motion.div>
    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
        aria-label="Delete news"
      >
        <Trash2 className="h-4 w-4" />
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