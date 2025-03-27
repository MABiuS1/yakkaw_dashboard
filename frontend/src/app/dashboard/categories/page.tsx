"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, ArrowLeft } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import Navbar from "@/components/ui/Navbar";
import DashCategoryCard from "@/components/ui/DashCategoryCard";
import Link from "next/link";

const CategoriesPage: React.FC = () => {
  const { categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
          <div className="animate-spin h-12 w-12 text-indigo-600 mb-4">Loading...</div>
          <p className="text-lg font-medium text-slate-700">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              All Categories
            </h1>
          </div>

          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <FolderOpen className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-500">No categories yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {categories.map((category) => (
                    <DashCategoryCard key={category.id} category={category} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default CategoriesPage; 