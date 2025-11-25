"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search, Loader2, Plus } from "lucide-react";

import { useNews } from "@/hooks/useNews";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsFormDialog } from "@/components/news/FormNewsDialog";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import Navbar from "@/components/ui/Navbar";

import type { News } from "@/constant/newsData";
import { CardSkeleton } from "@/components/ui/CardSkeleton";

const NewsPage = () => {
  const {
    // data
    categories,
    filteredNews,

    // ใช้คู่ searchInput + setSearchInput
    searchInput,
    setSearchInput,

    // state
    error,
    isLoading,   // โหลดครั้งแรก
    isFetching,  // รีเฟรชหลัง create/update/delete

    // dialogs
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,

    // delete
    setNewsToDelete,

    // form/edit
    currentForm,
    setCurrentForm,
    openCreateDialog,
    openEditDialog,

    // actions
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useNews();


 
    const sortedSponsors = useMemo(() => {
      if (isLoading) return [];
      const arr = [...filteredNews];
      arr.sort((a, b) => {
        const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        return bTime - aTime; // ใหม่ก่อน
      });
      return arr;
    }, [isLoading, filteredNews]).reverse();


  return (
    <>
      <Navbar />

      {/* แถบสถานะรีเฟรชข้อมูล (หลังโหลดครั้งแรก) */}
      {isFetching && !isLoading && (
        <div className="fixed top-0 left-0 right-0 z-40">
          <div className="h-1 w-full bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 animate-[pulse_1.2s_ease-in-out_infinite]" />
        </div>
      )}

      <div className="bg-gradient-to-b from-purple-50 to-indigo-50 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-6 max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-purple-800">Manage News</h1>
              <p className="text-purple-600 mt-1">Manage News for Post, Edit and Delete</p>
            </div>
            <Button
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              onClick={openCreateDialog}
              disabled={isLoading}
            >
              <Plus size={16} /> Add News
            </Button>
          </div>

         {/* Search */}
                   <div className="mb-6 max-w-xl relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                     <Input
                       placeholder="Search News..."
                       className="pl-9 bg-white py-5 rounded-xl shadow-sm disabled:opacity-60"
                       value={searchInput}
                       onChange={(e) => setSearchInput(e.target.value)}
                       disabled={isLoading}
                     />
                   </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-4 shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* List */}
          <AnimatePresence>
            <motion.div
          
              initial="hidden"
              animate="visible"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {isLoading ? (
                // ✅ โชว์ skeleton ตอนโหลดครั้งแรก
                Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              ) : sortedSponsors.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
          
                  className="col-span-full text-center p-10 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
                >
                  <h3 className="text-lg font-medium text-purple-700">No News found</h3>
                </motion.div>
              ) : (
                sortedSponsors.map((news) => (
                  <motion.div key={news.id} exit="exit">
                    <NewsCard
                      news={news}
                      onEdit={() => openEditDialog(news)}
                      onDelete={() => {
                        setNewsToDelete(news.id!);
                        setIsConfirmDialogOpen(true);
                      }}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* CREATE */}
        <NewsFormDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreate}
          form={currentForm}
          setForm={setCurrentForm}
          categories={categories}
          title="Create News"
          submitButtonText="CREATE"
        />

        {/* EDIT */}
        <NewsFormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdate}
          form={currentForm}
          setForm={setCurrentForm}
          categories={categories}
          title="Edit News"
          submitButtonText="UPDATE"
        />

        {/* DELETE CONFIRM */}
        <ConfirmDeleteDialog
          isOpen={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          onConfirm={handleDelete}
        />
      </div>
    </>
  );
};

export default NewsPage;