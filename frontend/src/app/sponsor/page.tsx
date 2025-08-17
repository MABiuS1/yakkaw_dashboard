"use client";

import React from "react";
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

const SponsorsPage: React.FC = () => {
  const {
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
  } = useSponsors();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      scale: 0.96,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const sortedSponsors = [...filteredSponsors]
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-amber-50 to-indigo-50 min-h-screen pt-7 pb-10 px-4 sm:px-6 lg:px-8 ">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-800">Manage Sponsors</h1>
              <p className="text-amber-600 mt-1">Add, update, and delete sponsors</p>
            </div>
            <Button
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-700"
              onClick={openCreateDialog}
            >
              <Plus size={16} /> Add Sponsor
            </Button>
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6"
          >
            <div className="rounded-xl md:col-span-6 relative shadow-md ">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 "
                size={20}
              />
              <Input
                placeholder="Search sponsors..."
                className="pl-10 bg-white py-5 rounded-xl focus:ring-5 transition-all duration-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Sponsor List */}
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {sortedSponsors.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full text-center p-10 bg-white rounded-lg shadow-lg border border-amber-100"
                >
                  <h3 className="text-lg font-medium text-amber-700">
                    No sponsor found
                  </h3>
                </motion.div>
              ) : (
                sortedSponsors.map((sponsor) => (
                  <motion.div key={sponsor.id} variants={itemVariants} exit="exit">
                    <SponsorsCard
                      sponsor={sponsor}
                      onEdit={() => {
                        openEditDialog(sponsor);
                        setIsEditDialogOpen(true);
                      }}
                      onDelete={() => {
                        setSponsorsToDelete(sponsor.id);
                        setIsConfirmDialogOpen(true);
                      }}
                      onView={() => {
                        setSelectedSponsor(sponsor);
                        setIsViewDialogOpen(true);
                      }}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
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
