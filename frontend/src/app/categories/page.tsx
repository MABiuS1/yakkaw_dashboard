"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Plus, Search } from "lucide-react";

import { useCategories } from "@/hooks/useCategories";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { FormDialog } from "@/components/categories/FormCategoryDialog";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import Navbar from "@/components/ui/Navbar";
import { RowSkeleton } from "@/components/ui/RowSkeleton";

const CategoryPage = () => {
  const {
    // data
    filteredCategories,

    // errors / status
    error,
    isLoading,      
    isFetching,    

    // search 
    searchInput,
    setSearchInput,

    // dialogs
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,

    // deletion
    setCategoryToDelete,

    // form/edit
    currentForm,
    setCurrentForm,
    openCreateDialog,
    openEditDialog,

    // actions
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCategories();



  return (
    <>
      <Navbar />

      {/* แถบสถานะรีเฟรชข้อมูล (หลังโหลดครั้งแรก) */}
      {isFetching && !isLoading && (
        <div className="fixed top-0 left-0 right-0 z-40">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 animate-[pulse_1.2s_ease-in-out_infinite]" />
        </div>
      )}

      <div className="bg-gradient-to-b from-emerald-50 to-green-50 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-emerald-700">Manage Categories</h1>
              <p className="text-emerald-600 mt-1">Manage Categories for Post, Edit and Delete</p>
            </div>
            <Button
              className="bg-emerald-500 hover:bg-emerald-700 disabled:opacity-60"
              onClick={openCreateDialog}
              disabled={isLoading}
            >
              <Plus size={16} /> Add Category
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
            <Input
              placeholder="Search categories..."
              className="pl-9 bg-white py-5 rounded-xl shadow-sm disabled:opacity-60"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* List container */}
          <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-emerald-600 border-b border-emerald-100 text-white text-sm">
              <div className="md:col-span-8">Name</div>
              <div className="md:col-span-2">ID</div>
              <div className="md:col-span-2 text-right">Actions</div>
            </div>

            {/* Rows */}
            <AnimatePresence initial={false}>
              {isLoading ? (
                <ul className="divide-y divide-emerald-100">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <RowSkeleton key={i} />
                  ))}
                </ul>
              ) : filteredCategories.length === 0 ? (
                <div className="p-8 text-center text-emerald-700">No categories found</div>
              ) : (
                <ul className="divide-y divide-emerald-100">
                  {filteredCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onEdit={() => openEditDialog(category)}
                      onDelete={() => {
                        setCategoryToDelete(category.id!);
                        setIsConfirmDialogOpen(true);
                      }}
                    />
                  ))}
                </ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CREATE */}
        <FormDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreate}
          form={currentForm}
          setForm={setCurrentForm}
          title="Create Category"
          submitButtonText="CREATE"
        />

        {/* EDIT */}
        <FormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdate}
          form={currentForm}
          setForm={setCurrentForm}
          title="Edit Category"
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

export default CategoryPage;