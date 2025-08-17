/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect, useCallback } from "react";
import type { Sponsor, SponsorForm } from "@/constant/sponsorData";

const EMPTY_FORM: SponsorForm = { name: "", logo: "", description: "", category: "" };
const API = "http://localhost:8080";

export const useSponsors = () => {
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [error, setError] = useState<string>("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

  const [sponsorsToDelete, setSponsorsToDelete] = useState<number | null>(null);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  const [currentSponsor, setCurrentSponsor] = useState<SponsorForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API}/me`, { credentials: "include" });
      if (!response.ok) throw new Error("Unauthorized");
    } catch {
      window.location.href = "/login";
    }
  }, []);

  const fetchSponsors = useCallback(async () => {
    try {
      const r = await fetch(`${API}/sponsors`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch sponsors");
      const data: Sponsor[] = await r.json();
      setSponsors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  // 👉 helper: เปิด dialog แบบถูกวิธี
  const openCreateDialog = () => {
    setCurrentSponsor(EMPTY_FORM);
    setEditingId(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (n: Sponsor) => {
    setEditingId(n.id);
    setCurrentSponsor({
      name: n.name ?? "",
      logo: n.logo ?? "",
      description: n.description ?? "",
      category: n.category ?? "",
    });
    setIsEditDialogOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/admin/sponsors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentSponsor),
      });
      if (!r.ok) throw new Error("Failed to create sponsors");
      await fetchSponsors();
      setIsCreateDialogOpen(false);
      setCurrentSponsor(EMPTY_FORM);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null) return;
    try {
      const r = await fetch(`${API}/admin/sponsors/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(currentSponsor),
      });
      if (!r.ok) throw new Error("Failed to update sponsors");
      await fetchSponsors();
      setIsEditDialogOpen(false);
      setCurrentSponsor(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (sponsorsToDelete == null) return;
    try {
      const r = await fetch(`${API}/admin/sponsors/${sponsorsToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to delete sponsors");
      await fetchSponsors();
      setIsConfirmDialogOpen(false);
      setSponsorsToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchSponsors();
  }, [checkAuth, fetchSponsors]);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      setFilteredSponsors(
        sponsors.filter((s) =>
          (s.name ?? "").toLowerCase().includes(q) ||
          (s.category ?? "").toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredSponsors(sponsors);
    }
  }, [searchQuery, sponsors]);

  return {
    // data
    sponsors,
    filteredSponsors,
    error,

    // search
    searchQuery,
    setSearchQuery,

    // dialogs
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,

    // delete
    sponsorsToDelete,
    setSponsorsToDelete,

    // view dialog
    isViewDialogOpen,
    setIsViewDialogOpen,
    selectedSponsor,
    setSelectedSponsor,

    // form/editing
    currentSponsor,
    setCurrentSponsor,
    openCreateDialog,
    openEditDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
