"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search, Plus } from "lucide-react";

import { useSponsors } from "@/hooks/useSponsor";
import { SponsorsCard } from "@/components/sponsors/SponsorsCard";
import { SponsorFormDialog } from "@/components/sponsors/FormSponsorDialog";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { SponsorDialog } from "@/components/sponsors/SponsorDialog";

import Navbar from "@/components/ui/Navbar";
import { CardSkeleton } from "@/components/ui/CardSkeleton";

const SponsorsPage = () => {
  const {
    // data
    filteredSponsors,
    error,

    // ✅ ใช้คู่ searchInput + setSearchInput (debounce อยู่ใน hook)
    searchInput,
    setSearchInput,

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

    // ✅ สถานะโหลด
    isLoading,   // โหลดครั้งแรก (ใช้โชว์ skeleton)
    isFetching,  // รีเฟรชหลัง create/update/delete (โชว์แถบบาง ๆ ด้านบน)
  } = useSponsors();

  // const containerVariants = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: { staggerChildren: 0.1 },
  //   },
  // };

  // const itemVariants = {
  //   hidden: { y: 20, opacity: 0 },
  //   visible: {
  //     y: 0,
  //     opacity: 1,
  //     transition: { type: "spring", stiffness: 300, damping: 24 },
  //   },
  //   exit: {
  //     scale: 0.96,
  //     opacity: 0,
  //     transition: { duration: 0.2 },
  //   },
  // };

  const sortedSponsors = useMemo(() => {
    if (isLoading) return [];
    const arr = [...filteredSponsors];
    arr.sort((a, b) => {
      const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return bTime - aTime; // ใหม่ก่อน
    });
    return arr;
  }, [isLoading, filteredSponsors]).reverse();


  return (
    <>
      <Navbar />

      {/* แถบสถานะรีเฟรชข้อมูล (หลังโหลดครั้งแรก) */}
      {isFetching && !isLoading && (
        <div className="fixed top-0 left-0 right-0 z-40">
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-indigo-400 to-amber-400 animate-[pulse_1.2s_ease-in-out_infinite]" />
        </div>
      )}

      <div className="bg-gradient-to-b from-amber-50 to-indigo-50 min-h-screen pt-7 pb-10 px-4 sm:px-6 lg:px-8 ">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-800">Manage Sponsors</h1>
              <p className="text-amber-600 mt-1">Manage Sponsors for Add, update, and Delete</p>
            </div>
            <Button
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-700 disabled:opacity-60"
              onClick={openCreateDialog}
              disabled={isLoading}
            >
              <Plus size={16} /> Add Sponsor
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6 max-w-xl relative">
          
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={20} />
              <Input
                placeholder="Search sponsors..."
                className="pl-10 bg-white py-5 rounded-xl focus:ring-5 disabled:opacity-60"
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

          {/* Sponsor List */}
          <AnimatePresence>
            <div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {isLoading ? (
                // ✅ โชว์ skeleton ระหว่างโหลดครั้งแรก
                Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              ) : sortedSponsors.length === 0 ? (
                <div

                  className="col-span-full text-center p-10 bg-white rounded-lg shadow-lg border border-amber-100"
                >
                  <h3 className="text-lg font-medium text-amber-700">No sponsor found</h3>
                </div>
              ) : (
                sortedSponsors.map((sponsor) => (
                  <div key={sponsor.id}  className="transition-transform duration-150 will-change-transform hover:scale-[1.01]">
                    <SponsorsCard
                      sponsor={sponsor}
                      onEdit={() => {
                        openEditDialog(sponsor);
                        setIsEditDialogOpen(true);
                      }}
                      onDelete={() => {
                        setSponsorsToDelete(sponsor.id!);
                        setIsConfirmDialogOpen(true);
                      }}
                      onView={() => {
                        setSelectedSponsor(sponsor);
                        setIsViewDialogOpen(true);
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </AnimatePresence>
        </motion.div>

        {/* CREATE */}
        <SponsorFormDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreate}
          form={currentSponsor}
          setForm={setCurrentSponsor}
          title="Create Sponsor"
          submitButtonText="Create"
        />

        {/* EDIT */}
        <SponsorFormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdate}
          form={currentSponsor}
          setForm={setCurrentSponsor}
          title="Edit Sponsor"
          submitButtonText="Update"
        />

        {/* DELETE CONFIRM */}
        <ConfirmDeleteDialog
          isOpen={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          onConfirm={handleDelete}
        />

        {/* VIEW */}
        <SponsorDialog
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          sponsor={selectedSponsor}
        />
      </div>
    </>
  );
};

export default SponsorsPage;