/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback } from "react";
import type { News, NewsForm } from "@/constant/newsData";
import type { Category } from "@/constant/categoryData";

const API = "http://localhost:8080";

const EMPTY_FORM: NewsForm = {
  title: "",
  description: "",
  image: "",
  url: "",
  date: "",          // ถ้าเว้นว่าง จะตั้งเป็นตอนส่งให้เป็น now()
  category_id: 0,
};

export const useNews = () => {
  // data
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ui/state
 
  const [error, setError] = useState<string>("");

  // dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  // deletion
  const [newsToDelete, setNewsToDelete] = useState<number | null>(null);

  // form/editing
  const [currentForm, setCurrentForm] = useState<NewsForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);

  // auth (ถ้าจำเป็น)
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API}/me`, { credentials: "include" });
      if (!res.ok) throw new Error("Unauthorized");
    } catch {
      window.location.href = "/login";
    }
  }, []);

  // fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API}/categories`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data: Category[] = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  // fetch news
  const fetchNews = useCallback(async () => {
    try {
      
      setError("");
      const res = await fetch(`${API}/news`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch news");
      const data: News[] = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  // helpers: open dialogs
  const openCreateDialog = () => {
    setCurrentForm(EMPTY_FORM);
    setEditingId(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (n: News) => {
    setEditingId(n.id);
    setCurrentForm({
      title: n.title ?? "",
      description: n.description ?? "",
      image: n.image ?? "",
      url: n.url ?? "",
      date: n.date ?? "",
      category_id: n.category_id ?? 0,
    });
    setIsEditDialogOpen(true);
  };

  // CRUD
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: NewsForm = {
        ...currentForm,
        category_id: Number(currentForm.category_id) || 0,
        date: currentForm.date && currentForm.date.trim() !== "" ? currentForm.date : new Date().toISOString(),
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

      await fetchNews();
      setIsCreateDialogOpen(false);
      setCurrentForm(EMPTY_FORM);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null) return;
    try {
      const payload: NewsForm = {
        ...currentForm,
        category_id: Number(currentForm.category_id) || 0,
        date: currentForm.date && currentForm.date.trim() !== "" ? currentForm.date : new Date().toISOString(),
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

      await fetchNews();
      setIsEditDialogOpen(false);
      setCurrentForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (newsToDelete == null) return;
    try {
      const res = await fetch(`${API}/admin/news/${newsToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete news");

      await fetchNews();
      setIsConfirmDialogOpen(false);
      setNewsToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // effects
  useEffect(() => {
    checkAuth();
    fetchCategories();
    fetchNews();
  }, [checkAuth, fetchCategories, fetchNews]);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredNews(news);
      return;
    }
    setFilteredNews(
      news.filter((n) =>
        (n.title ?? "").toLowerCase().includes(q) ||
        (n.description ?? "").toLowerCase().includes(q) ||
        (n.url ?? "").toLowerCase().includes(q)
      )
    );
  }, [searchQuery, news]);

  // optional: sort by date desc (ใหม่→เก่า)
  useEffect(() => {
    setFilteredNews((prev) =>
      [...prev].sort((a, b) => {
        const at = new Date(a.date ?? 0).getTime();
        const bt = new Date(b.date ?? 0).getTime();
        return bt - at;
      })
    );
  }, [news]);

  return {
    // data
    categories,
    news,
    filteredNews,

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

    // util
    fetchCategories,
    fetchNews,
  };
};
