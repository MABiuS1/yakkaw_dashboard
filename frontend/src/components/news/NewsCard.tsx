/* eslint-disable @next/next/no-img-element */
import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { NewsCardProps } from "@/constant/newsData";

export const NewsCard: React.FC<NewsCardProps> = ({ news, onEdit, onDelete }) => {
  const shouldTruncate = (news.description ?? "").length > 50;
  const truncatedDescription = shouldTruncate
    ? `${news.description.substring(0, 75)}...`
    : news.description;

  const dateText = news.date ? new Date(news.date).toLocaleString() : "";
  const categoryText = news.category?.name ?? "";

  // ตัวช่วย: คอนเทนเนอร์รูป ถ้ามี URL จะเป็น <a> ออกลิงก์, ถ้าไม่มีจะ fallback เป็น <div> (กดทีหลังเปิด dialog ได้ถ้าส่ง onView มา)
  const ImageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (news.url) {
      return (
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative w-full h-48 group overflow-hidden rounded-b-lg"
          aria-label={`Open article: ${news.title}`}
        >
          {children}
        </a>
      );
    }
  
  };

  return (
    <motion.div className="bg-white rounded-lg overflow-hidden border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-2">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-medium text-purple-800">
            {news.title}
            {categoryText && <p className="text-xs text-purple-400 -mt-1">{categoryText}</p>}
            {dateText && <p className="text-xs text-purple-500 mt-2">{dateText}</p>}
          </CardTitle>
        </div>

        <div className="flex gap-1">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
            >
              <Pencil size={16} />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
            >
              <Trash2 size={16} />
            </Button>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-0">
        <ImageWrapper>
          <motion.img
            src={news.image || "/placeholder.png"}
            alt={news.title}
            className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white group-hover:underline transition-all duration-300">
              {truncatedDescription}
            </p>
          </div>

        </ImageWrapper>
      </CardContent>
    </motion.div>
  );
};
