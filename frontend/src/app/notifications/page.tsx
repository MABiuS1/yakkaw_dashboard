"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search, Plus } from "lucide-react";

import { useNotifications } from "@/hooks/useNotification";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { FormDialog } from "@/components/notifications/FormNotificationDialog";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { NotificationDialog } from "@/components/notifications/NotificationDialog";
import type { Notification } from "@/constant/notificationData";

import Navbar from "@/components/ui/Navbar";
const NotificationPage: React.FC = () => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const {
    // lists & search
    filteredNotifications,
    searchQuery,
    setSearchQuery,

    // errors
    error,

    // dialogs (setters ใน hook จะจัดการ reset form ให้แล้ว)
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,

    // delete
    setNotificationToDelete,
    handleDelete,

    // form state
    currentForm,
    setCurrentForm,

    // submit
    handleCreate,
    handleUpdate,

    // helpers เปิด dialog แบบถูกวิธี (รีเซ็ต/อัดค่าให้อัตโนมัติ)
    openCreateDialog,
    openEditDialog,
  } = useNotifications();

  
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

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
    const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
    return bTime - aTime; 
  }).reverse(); 


  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-blue-50 to-indigo-50 min-h-screen pt-7 pb-10 px-4 sm:px-6 lg:px-8 ">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-800">Manage Notification</h1>
              <p className="text-blue-600 mt-1">Manage Notification for Add, Update and Delete</p>
            </div>
            <Button
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700"
              onClick={openCreateDialog} // ใช้ helper เพื่อรีเซ็ตฟอร์มก่อนเปิด
            >
              <Plus size={16} /> Add Notification
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6"
          >
            <div className="rounded-xl md:col-span-6 relative shadow-md ">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 "
                size={20}
              />
              <Input
                placeholder="Search notifications..."
                className="pl-10 bg-white py-5 rounded-xl focus:ring-5 transition-all duration-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {sortedNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full text-center p-10 bg-white rounded-lg shadow-lg border border-green-100"
                >
                  <h3 className="text-lg font-medium text-green-700">
                    No Notification found
                  </h3>
                </motion.div>
              ) : (
                sortedNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    // ส่ง notification เดิมไปเหมือนเดิม
                    notification={notification}
                    onEdit={() => {
                      openEditDialog(notification);
                      setIsEditDialogOpen(true);
                    }}
                    onDelete={() => {
                      setNotificationToDelete(notification.id as any);
                      setIsConfirmDialogOpen(true);
                    }}
                    onView={() => {
                      setSelectedNotification(notification);
                      setIsViewDialogOpen(true);
                    }}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* CREATE */}
        <FormDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={(open) => setIsCreateDialogOpen(open)} // hook จะล้าง form ให้ตอนปิด
          onSubmit={handleCreate}
          form={currentForm}
          setForm={setCurrentForm}
          title="Create Notification"
          submitButtonText="Create"
        />

        {/* EDIT */}
        <FormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => setIsEditDialogOpen(open)} // hook จะล้าง form ให้ตอนปิด
          onSubmit={handleUpdate}
          form={currentForm}
          setForm={setCurrentForm}
          title="Edit Notification"
          submitButtonText="Update"
        />

        <ConfirmDeleteDialog
          isOpen={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          onConfirm={handleDelete}
        />

        <NotificationDialog
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          notification={selectedNotification}
        />
      </div>
    </>
  );
};

export default NotificationPage;
