/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { News, NewsForm } from "@/constant/newsData";
import type { Category } from "@/constant/categoryData";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api` : '/api';
const EMPTY_FORM: NewsForm = {
  title: "",
  description: "",
  image: "",
  url: "",
  date: "",          // ถ้าว่าง จะเติมตอนส่ง (now ISO)
  category_id: 0,
};

export const useNews = () => {
  // ---------- data ----------
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);

  // แยก input ที่ผู้ใช้พิมพ์ออกจาก query ที่จะใช้กรอง (debounced)
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ---------- status ----------
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);     // โหลดครั้งแรกของข่าว
  const [isFetching, setIsFetching] = useState<boolean>(false);  // รีเฟรชรอบถัดไป
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // ---------- dialogs ----------
  const [isEditDialogOpen, _setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, _setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  // ---------- deletion ----------
  const [newsToDelete, setNewsToDelete] = useState<number | null>(null);

  // ---------- form/editing ----------
  const [currentForm, setCurrentForm] = useState<NewsForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);

  // abort controllers (คนละตัวสำหรับ categories/news)
  const newsAbortRef = useRef<AbortController | null>(null);
  const catAbortRef  = useRef<AbortController | null>(null);

  // transition เพื่อลดการ block UI ตอนอัปเดต state จำนวนมาก
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

  // ---------- auth ----------
  const checkAuth = useCallback(async () => {
    const res = await fetch(`${API}/me`, { credentials: "include" });
    if (!res.ok) throw new Error("Unauthorized");
  }, []);

  // ---------- fetch: categories ----------
  const fetchCategories = useCallback(async () => {
    catAbortRef.current?.abort();
    const controller = new AbortController();
    catAbortRef.current = controller;
    try {
      const res = await fetch(`${API}/categories`, {
        credentials: "include",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data: Category[] = await res.json();
      startTransition(() => setCategories(Array.isArray(data) ? data : []));
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to fetch categories");
    }
  }, []);

  // ---------- fetch: news ----------
  const fetchNews = useCallback(async (isInitial = false) => {
    newsAbortRef.current?.abort();
    const controller = new AbortController();
    newsAbortRef.current = controller;

    try {
      isInitial ? setIsLoading(true) : setIsFetching(true);
      setError("");

      const res = await fetch(`${API}/news`, {
        credentials: "include",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to fetch news");
      const data: News[] = await res.json();

      // เก็บและ sort ใหม่→เก่า ไว้ตรงนี้ จะได้ไม่ต้อง sort บ่อยๆ ที่หน้า UI
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
        const at = new Date(a.date ?? 0).getTime();
        const bt = new Date(b.date ?? 0).getTime();
        return bt - at;
      });

      startTransition(() => setNews(sorted));
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to fetch news");
    } finally {
      isInitial ? setIsLoading(false) : setIsFetching(false);
    }
  }, []);

  // ---------- open dialogs ----------
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (n: News) => {
    setEditingId(Number(n.id));
    setCurrentForm({
      title: n.title ?? "",
      description: n.description ?? "",
      image: n.image ?? "",
      url: n.url ?? "",
      date: n.date ?? "",          // เก็บตามที่มี; ถ้าว่างจะเติมตอนส่ง
      category_id: n.category_id ?? 0,
    });
    setIsEditDialogOpen(true);
  };

  // ---------- CRUD ----------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    try {
      setIsCreating(true);

      const payload: NewsForm = {
        ...currentForm,
        category_id: Number(currentForm.category_id) || 0,
        date:
          currentForm.date && currentForm.date.trim() !== ""
            ? currentForm.date
            : new Date().toISOString(),
      };

      const res = await fetch(`${API}/admin/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to create news: ${text}`);
      }

      await fetchNews(false);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create news");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || isUpdating) return;
    try {
      setIsUpdating(true);

      const payload: NewsForm = {
        ...currentForm,
        category_id: Number(currentForm.category_id) || 0,
        date:
          currentForm.date && currentForm.date.trim() !== ""
            ? currentForm.date
            : new Date().toISOString(),
      };

      const res = await fetch(`${API}/admin/news/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update news: ${text}`);
      }

      await fetchNews(false);
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update news");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (newsToDelete == null || isDeleting) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`${API}/admin/news/${newsToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete news");

      await fetchNews(false);
      setIsConfirmDialogOpen(false);
      setNewsToDelete(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete news");
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------- effects ----------
  useEffect(() => {
    (async () => {
      try {
        await checkAuth();
        await Promise.all([fetchCategories(), fetchNews(true)]);
      } catch {
        // ถ้า auth fail → ไปหน้า login
        window.location.href = "/login";
      }
    })();

    return () => {
      newsAbortRef.current?.abort();
      catAbortRef.current?.abort();
    };
  }, [checkAuth, fetchCategories, fetchNews]);

  // debounce: searchInput -> searchQuery
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  // filter + memo
  const computedFiltered = useMemo(() => {
    if (!searchQuery) return news;
    const q = searchQuery.toLowerCase();
    return news.filter((n) =>
      (n.title ?? "").toLowerCase().includes(q) ||
      (n.description ?? "").toLowerCase().includes(q) ||
      (n.url ?? "").toLowerCase().includes(q)
    );
  }, [news, searchQuery]);

  useEffect(() => {
    setFilteredNews(computedFiltered);
  }, [computedFiltered]);

  // ---------- expose ----------
  return {
    // data
    categories,
    news,
    filteredNews,

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

    // deletion
    newsToDelete,
    setNewsToDelete,

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
    refetch: () => fetchNews(false),
    refetchCategories: () => fetchCategories(),
  };
};
