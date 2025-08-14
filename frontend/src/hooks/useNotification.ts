// useNotification.ts
'use client'
import { useState, useEffect } from "react";
import type { Notification } from "@/constant/notificationData";


type NotificationForm = { title: string; message: string; category: string; icon?: string };

const EMPTY_FORM: NotificationForm = { title: "", message: "", category: "", icon: "" };
const API = "http://localhost:8080";

export const useNotifications = () => {
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string>("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // 👉 ฟอร์มที่ใช้ใน Dialog (Create/Update)
  const [currentForm, setCurrentForm] = useState<NotificationForm>(EMPTY_FORM);
  // 👉 id ที่กำลังแก้ไข (ถ้า null คือโหมด create)
  const [editingId, setEditingId] = useState<number | null>(null);

  
  

  const checkAuth = async () => {
    try {
      const r = await fetch(`${API}/me`, { credentials: "include" });
      if (!r.ok) throw new Error("Unauthorized");
    } catch {
      window.location.href = "/login";
    }
  };

  const fetchNotifications = async () => {
    try {
      const r = await fetch(`${API}/notifications`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch notifications");
      const data: Notification[] = await r.json();
      setNotifications(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // 👉 helper: เปิด dialog แบบถูกวิธี
  const openCreateDialog = () => {
    setCurrentForm(EMPTY_FORM);
    setEditingId(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (n: Notification) => {
  setEditingId(n.id);
  setCurrentForm({
    title: n.title ?? "",
    message: n.message ?? "",
    category: n.category ?? "",
    icon: n.icon ?? "",
  });
  setIsEditDialogOpen(true);
};

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/admin/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentForm), // ส่งเฉพาะ body ฟอร์ม
      });
      if (!r.ok) throw new Error("Failed to create notification");
      await fetchNotifications();
      setIsCreateDialogOpen(false);
      setCurrentForm(EMPTY_FORM);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const r = await fetch(`${API}/admin/notifications/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentForm),
      });
      if (!r.ok) throw new Error("Failed to update notification");
      await fetchNotifications();
      setIsEditDialogOpen(false);
      setEditingId(null);
      setCurrentForm(EMPTY_FORM);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!notificationToDelete) return;
    try {
      const r = await fetch(`${API}/admin/notifications/${notificationToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to delete notification");
      await fetchNotifications();
      setIsConfirmDialogOpen(false);
      setNotificationToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredNotifications(
        notifications.filter((n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredNotifications(notifications);
    }
  }, [searchQuery, notifications]);

  return {
    // lists
    filteredNotifications,
    notifications,

    // search
    searchQuery,
    setSearchQuery,

    // dialogs
    isEditDialogOpen,
    setIsEditDialogOpen: (open: boolean) => {
      if (!open) {
        setEditingId(null);
        setCurrentForm(EMPTY_FORM);
      }
      setIsEditDialogOpen(open);
    },
    isCreateDialogOpen,
    setIsCreateDialogOpen: (open: boolean) => {
      if (!open) {
        setEditingId(null);
        setCurrentForm(EMPTY_FORM);
      }
      setIsCreateDialogOpen(open);
    },
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,

    // helper funcs for main
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

    // error
    error,
  };
};
