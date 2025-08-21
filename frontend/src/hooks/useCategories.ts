/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Category, CategoryForm } from "@/constant/categoryData";

const API = "http://localhost:8080";

const EMPTY_FORM: CategoryForm = { name: "" };

export const useCategories = () => {
  // ---------- data ----------
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  // แยก input ที่ผู้ใช้พิมพ์ออกจาก query (debounced)
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ---------- status ----------
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);     // โหลดครั้งแรก
  const [isFetching, setIsFetching] = useState<boolean>(false);  // รีเฟรชรอบถัดไป
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // ---------- dialogs ----------
  const [isEditDialogOpen, _setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, _setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  // ---------- deletion ----------
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  // ---------- form/editing ----------
  const [currentForm, setCurrentForm] = useState<CategoryForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);

  // abort controller สำหรับ fetch ปัจจุบัน
  const fetchAbortRef = useRef<AbortController | null>(null);

  // transition เพื่อลด block UI ตอนอัปเดต state เยอะๆ
  const [_isPending, startTransition] = useTransition();

  // ---------- helpers ----------
  const resetForm = () => {
    setEditingId(null);
    setCurrentForm(EMPTY_FORM);
  };
  const setIsEditDialogOpen = (open: boolean) => {
    if (!open) resetForm();
    _setIsEditDialogOpen(open);
  };
  const setIsCreateDialogOpen = (open: boolean) => {
    if (!open) resetForm();
    _setIsCreateDialogOpen(open);
  };

  // ---------- auth (ถ้าไม่ต้องเช็ก ลบฟังก์ชันนี้/การเรียกใช้ได้) ----------
  const checkAuth = useCallback(async () => {
    const res = await fetch(`${API}/me`, { credentials: "include" });
    if (!res.ok) throw new Error("Unauthorized");
  }, []);

  // ---------- fetch ----------
  const fetchCategories = useCallback(async (isInitial = false) => {
    // ยกเลิกของเก่า (ถ้ามี)
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    try {
      isInitial ? setIsLoading(true) : setIsFetching(true);
      setError("");

      const res = await fetch(`${API}/categories`, {
        credentials: "include",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data: Category[] = await res.json();

      startTransition(() => {
        // sort ตามชื่อ เพื่อให้เสถียร
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" })
        );
        setCategories(sorted);
      });
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to fetch categories");
    } finally {
      isInitial ? setIsLoading(false) : setIsFetching(false);
    }
  }, []);

  // ---------- helpers: open dialogs ----------
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingId(Number(cat.id));
    setCurrentForm({ name: cat.name ?? "" });
    setIsEditDialogOpen(true);
  };

  // ---------- CRUD ----------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    try {
      setIsCreating(true);
      const res = await fetch(`${API}/admin/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentForm),
      });
      if (!res.ok) throw new Error("Failed to create category");

      await fetchCategories(false);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create category");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || isUpdating) return;
    try {
      setIsUpdating(true);
      const res = await fetch(`${API}/admin/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentForm),
      });
      if (!res.ok) throw new Error("Failed to update category");

      await fetchCategories(false);
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update category");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (categoryToDelete == null || isDeleting) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`${API}/admin/categories/${categoryToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete category");

      await fetchCategories(false);
      setIsConfirmDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------- effects ----------
  useEffect(() => {
    (async () => {
      try {
        await checkAuth();
        await fetchCategories(true);
      } catch {
        // ถ้าไม่ต้องการเช็ก auth ลบ try/catch นี้ออกได้
        window.location.href = "/login";
      }
    })();

    return () => {
      fetchAbortRef.current?.abort();
    };
  }, [checkAuth, fetchCategories]);

  // debounce: searchInput -> searchQuery
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  // filter + memo
  const computedFiltered = useMemo(() => {
    if (!searchQuery) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter((c) => (c.name ?? "").toLowerCase().includes(q));
  }, [categories, searchQuery]);

  useEffect(() => {
    setFilteredCategories(computedFiltered);
  }, [computedFiltered]);

  // ---------- expose ----------
  return {
    // data
    categories,
    filteredCategories,

    // search
    searchInput,      // ใช้กับ <Input value={searchInput} onChange={...}>
    setSearchInput,
    searchQuery,      // เผื่อหน้าเก่ายังใช้ตัวนี้
    setSearchQuery,

    // status
    error,
    isLoading,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,

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

    // manual refetch
    refetch: () => fetchCategories(false),
  };
};
