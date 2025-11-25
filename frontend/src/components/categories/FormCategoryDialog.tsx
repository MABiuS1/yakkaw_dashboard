import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoryFormDialogProps } from "@/constant/categoryData";

export const FormDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  form,
  setForm,
  title,
  submitButtonText,
}:CategoryFormDialogProps) => {
  const resetForm = () => setForm({ name: "" });

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="border-emerald-100">
        <DialogHeader>
          <DialogTitle className="text-emerald-800">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-emerald-700">Category Name</label>
            <Input
              placeholder="Category Name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
              className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-700 text-white">
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};