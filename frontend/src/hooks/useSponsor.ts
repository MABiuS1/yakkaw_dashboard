/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Sponsor, SponsorForm } from "@/constant/sponsorData";

const EMPTY_FORM: SponsorForm = { name: "", logo: "", description: "", category: "" };
const API = "http://localhost:8080";

export const useSponsors = () => {
  // ---------------- state: data ----------------
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);

  // แยก searchInput (พิมพ์สด) ออกจาก searchQuery (ค่า debounced ที่เอาไปกรอง)
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ---------------- state: status ----------------
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);     // โหลดครั้งแรก
  const [isFetching, setIsFetching] = useState<boolean>(false);  // โหลดรอบถัดไป/รีเฟรช
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // ---------------- state: dialogs ----------------
  const [isEditDialogOpen, _setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, _setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  // ---------------- state: view / selection ----------------
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  // ---------------- state: form / editing ----------------
  const [currentSponsor, setCurrentSponsor] = useState<SponsorForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sponsorsToDelete, setSponsorsToDelete] = useState<number | null>(null);

  // abort controller สำหรับ fetch ปัจจุบัน (ยกเลิกได้)
  const fetchAbortRef = useRef<AbortController | null>(null);

  // transition เพื่อไม่ block UI ตอนอัปเดต state เยอะ ๆ
  const [_isPending, startTransition] = useTransition();

  // ---------------- helpers ----------------
  const resetForm = () => {
    setEditingId(null);
    setCurrentSponsor(EMPTY_FORM);
  };

  const setIsEditDialogOpen = (open: boolean) => {
    if (!open) resetForm();
    _setIsEditDialogOpen(open);
  };
  const setIsCreateDialogOpen = (open: boolean) => {
    if (!open) resetForm();
    _setIsCreateDialogOpen(open);
  };

  // ---------------- auth ----------------
  const checkAuth = useCallback(async () => {
    const r = await fetch(`${API}/me`, { credentials: "include" });
    if (!r.ok) throw new Error("Unauthorized");
  }, []);

  // ---------------- fetch ----------------
  const fetchSponsors = useCallback(async (isInitial = false) => {
    // ยกเลิกรอบก่อนถ้ามี
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    try {
      isInitial ? setIsLoading(true) : setIsFetching(true);
      setError("");

      const r = await fetch(`${API}/sponsors`, {
        credentials: "include",
        signal: controller.signal,
      });
      if (!r.ok) throw new Error("Failed to fetch sponsors");
      const data: Sponsor[] = await r.json();

      startTransition(() => {
        setSponsors(Array.isArray(data) ? data : []);
      });
    } catch (err: any) {
      if (err?.name === "AbortError") return; // ถูกยกเลิก—ไม่ต้องตั้ง error
      setError(err?.message ?? "Failed to fetch sponsors");
    } finally {
      isInitial ? setIsLoading(false) : setIsFetching(false);
    }
  }, []);

  // ---------------- dialog open helpers ----------------
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (n: Sponsor) => {
    setEditingId(Number(n.id));
    setCurrentSponsor({
      name: n.name ?? "",
      logo: n.logo ?? "",
      description: n.description ?? "",
      category: n.category ?? "",
    });
    setIsEditDialogOpen(true);
  };

  // ---------------- CRUD ----------------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    try {
      setIsCreating(true);
      const r = await fetch(`${API}/admin/sponsors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentSponsor),
      });
      if (!r.ok) throw new Error("Failed to create sponsor");

      await fetchSponsors(false);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create sponsor");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || isUpdating) return;
    try {
      setIsUpdating(true);
      const r = await fetch(`${API}/admin/sponsors/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentSponsor),
      });
      if (!r.ok) throw new Error("Failed to update sponsor");

      await fetchSponsors(false);
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update sponsor");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (sponsorsToDelete == null || isDeleting) return;
    try {
      setIsDeleting(true);
      const r = await fetch(`${API}/admin/sponsors/${sponsorsToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to delete sponsor");

      await fetchSponsors(false);
      setIsConfirmDialogOpen(false);
      setSponsorsToDelete(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete sponsor");
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------------- effects ----------------
  useEffect(() => {
    (async () => {
      try {
        await checkAuth();
        await fetchSponsors(true);
      } catch {
        window.location.href = "/login";
      }
    })();

    return () => {
      fetchAbortRef.current?.abort();
    };
  }, [checkAuth, fetchSponsors]);

  // debounce searchInput -> searchQuery (ประมาณ 250ms)
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  // คำนวณรายการที่ผ่านการกรอง (memo เพื่อลด re-render)
  const computedFiltered = useMemo(() => {
    if (!searchQuery) return sponsors;
    const q = searchQuery.toLowerCase();
    return sponsors.filter((s) =>
      (s.name ?? "").toLowerCase().includes(q) ||
      (s.category ?? "").toLowerCase().includes(q) ||
      (s.description ?? "").toLowerCase().includes(q)
    );
  }, [sponsors, searchQuery]);

  useEffect(() => {
    setFilteredSponsors(computedFiltered);
  }, [computedFiltered]);

  // ---------------- expose API ----------------
  return {
    // data
    sponsors,
    filteredSponsors,

    // search
    searchInput,       // ใช้กับ <Input value={searchInput} onChange={setSearchInput}>
    setSearchInput,
    searchQuery,       // เผื่อหน้าเดิมยังใช้ตัวนี้อยู่
    setSearchQuery,

    // dialogs
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,

    // view dialog
    isViewDialogOpen,
    setIsViewDialogOpen,
    selectedSponsor,
    setSelectedSponsor,

    // delete
    sponsorsToDelete,
    setSponsorsToDelete,
    handleDelete,

    // form/editing
    currentSponsor,
    setCurrentSponsor,
    editingId,
    openCreateDialog,
    openEditDialog,
    handleCreate,
    handleUpdate,

    // status
    isLoading,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    error,

    // manual refetch
    refetch: () => fetchSponsors(false),
  };
};
