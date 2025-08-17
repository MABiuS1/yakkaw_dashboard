/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback } from "react";
import type { Category, CategoryForm } from "@/constant/categoryData";

const API = "http://localhost:8080";

export const useCategories = () => {
  // data
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ui/state
  const [error, setError] = useState<string>("");

  // dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  // deletion
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  // form/editing
  const [currentForm, setCurrentForm] = useState<CategoryForm>({ name: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  // fetch
  const fetchCategories = useCallback(async () => {
    try {

      setError("");
      const res = await fetch(`${API}/categories`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data: Category[] = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  // helpers
  const openCreateDialog = () => {
    setCurrentForm({ name: "" });
    setEditingId(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingId(cat.id);
    setCurrentForm({ name: cat.name });
    setIsEditDialogOpen(true);
  };

  // CRUD
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/admin/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentForm),
      });
      if (!res.ok) throw new Error("Failed to create category");
      await fetchCategories();
      setIsCreateDialogOpen(false);
      setCurrentForm({ name: "" });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null) return;
    try {
      const res = await fetch(`${API}/admin/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentForm),
      });
      if (!res.ok) throw new Error("Failed to update category");
      await fetchCategories();
      setIsEditDialogOpen(false);
      setCurrentForm({ name: "" });
      setEditingId(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (categoryToDelete == null) return;
    try {
      const res = await fetch(`${API}/admin/categories/${categoryToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete category");
      await fetchCategories();
      setIsConfirmDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // effects
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredCategories(categories);
      return;
    }
    setFilteredCategories(
      categories.filter((c) => (c.name ?? "").toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  return {
    // data
    categories,
    filteredCategories,

    // search
    searchQuery,
    setSearchQuery,

    // state
    error,

    // dialogs
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,

    // delete
    categoryToDelete,
    setCategoryToDelete,

    // form/edit
    currentForm,
    setCurrentForm,
    editingId,
    openCreateDialog,
    openEditDialog,

    // actions
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
