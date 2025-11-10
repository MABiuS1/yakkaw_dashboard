// useNotification.ts
'use client'
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Notification, NotificationForm } from "@/constant/notificationData";

const EMPTY_FORM: NotificationForm = { title: "", message: "", category: "", icon: "" };
const API = process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api` : '/api';

export const useNotifications = () => {
  // --- data ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchInput, setSearchInput] = useState("");  // สิ่งที่พิมพ์จริง
  const [searchQuery, setSearchQuery] = useState("");  // สิ่งที่ใช้ค้นหา (debounced)

  // --- status ---
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);         // โหลดครั้งแรก + refetch
  const [isFetching, setIsFetching] = useState<boolean>(false);       // โหลดรอบต่อๆไป
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // --- dialogs ---
  const [isEditDialogOpen, _setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, _setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  const [notificationToDelete, setNotificationToDelete] = useState<string | number | null>(null);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const [currentForm, setCurrentForm] = useState<NotificationForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);

  // สำหรับยกเลิก fetch เดิมเมื่อมีรอบใหม่
  const fetchAbortRef = useRef<AbortController | null>(null);

  // transition (เผื่อไปใช้กับ UI ตอนอัปเดต state หนักๆ)
  const [_isPending, startTransition] = useTransition();

  // -------- utils --------
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

  // -------- auth --------
  const checkAuth = async () => {
    const r = await fetch(`${API}/me`, { credentials: "include" });
    if (!r.ok) throw new Error("Unauthorized");
  };

  // -------- fetch --------
  const fetchNotifications = async (isInitial = false) => {
    // ยกเลิกของเก่า (ถ้ามี)
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    try {
      isInitial ? setIsLoading(true) : setIsFetching(true);
      setError("");

      const r = await fetch(`${API}/notifications`, {
        credentials: "include",
        signal: controller.signal,
      });
      if (!r.ok) throw new Error("Failed to fetch notifications");
      const data: Notification[] = await r.json();

      startTransition(() => {
        setNotifications(data || []);
      });
    } catch (err: any) {
      if (err?.name === "AbortError") return; // โดนยกเลิกรอบเก่า
      setError(err?.message ?? "Failed to fetch notifications");
    } finally {
      isInitial ? setIsLoading(false) : setIsFetching(false);
    }
  };

  // -------- helpers (open dialogs) --------
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (n: Notification) => {
    setEditingId(Number(n.id));
    setCurrentForm({
      title: n.title ?? "",
      message: n.message ?? "",
      category: n.category ?? "",
      icon: n.icon ?? "",
    });
    setIsEditDialogOpen(true);
  };

  // -------- CRUD --------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    try {
      setIsCreating(true);
      const r = await fetch(`${API}/admin/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentForm),
      });
      if (!r.ok) throw new Error("Failed to create notification");

      // refetch
      await fetchNotifications(false);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create notification");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || isUpdating) return;
    try {
      setIsUpdating(true);
      const r = await fetch(`${API}/admin/notifications/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentForm),
      });
      if (!r.ok) throw new Error("Failed to update notification");

      await fetchNotifications(false);
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update notification");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!notificationToDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      const r = await fetch(`${API}/admin/notifications/${notificationToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to delete notification");

      await fetchNotifications(false);
      setIsConfirmDialogOpen(false);
      setNotificationToDelete(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete notification");
    } finally {
      setIsDeleting(false);
    }
  };

  // -------- effects --------
  // โหลดครั้งแรก: auth + data (ถ้า auth fail → redirect ที่หน้า /login)
  useEffect(() => {
    (async () => {
      try {
        await checkAuth();
        await fetchNotifications(true);
      } catch {
        window.location.href = "/login";
      }
    })();

    return () => {
      fetchAbortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce searchInput -> searchQuery (200–300ms)
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  // filter แบบ memo
  const computedFiltered = useMemo(() => {
    if (!searchQuery) return notifications;
    const q = searchQuery.toLowerCase();
    return notifications.filter((n) =>
      (n.title ?? "").toLowerCase().includes(q) ||
      (n.message ?? "").toLowerCase().includes(q) ||
      (n.category ?? "").toLowerCase().includes(q)
    );
  }, [notifications, searchQuery]);

  useEffect(() => {
    setFilteredNotifications(computedFiltered);
  }, [computedFiltered]);

  return {
    // lists
    notifications,
    filteredNotifications,

    // search (แยก input กับ query เผื่อ debounce)
    searchInput,
    setSearchInput,
    searchQuery, // ถ้าหน้า UI ยังใช้ searchQuery เดิมอยู่ก็ยังมีให้
    setSearchQuery,

    // dialogs
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,

    // helper funcs
    openCreateDialog,
    openEditDialog,

    // delete
    notificationToDelete,
    setNotificationToDelete,
    handleDelete,

    // view dialog
    isViewDialogOpen,
    setIsViewDialogOpen,
    selectedNotification,
    setSelectedNotification,

    // form state + editing id
    currentForm,
    setCurrentForm,
    editingId,

    // submit
    handleCreate,
    handleUpdate,

    // status
    isLoading,   // โหลดครั้งแรก (ใช้กับ skeleton ทั้งหน้า)
    isFetching,  // รีเฟรชข้อมูลรอบหลัง (เช่นหลังสร้าง/อัปเดต/ลบ)
    isCreating,
    isUpdating,
    isDeleting,

    // error
    error,

    // manual refetch (ถ้าหน้าไหนอยากใช้ปุ่ม Refresh)
    refetch: () => fetchNotifications(false),
  };
};
