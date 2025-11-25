import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SponsorForm } from "@/constant/sponsorData";

export type SponsorFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  form: SponsorForm;
  setForm: React.Dispatch<React.SetStateAction<SponsorForm>>;
  title: string;
  submitButtonText: string;
};

const MAX_DESCRIPTION = 2000;

export const SponsorFormDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  form,
  setForm,
  title,
  submitButtonText,
}:SponsorFormDialogProps) => {
  const [fullScreen, setFullScreen] = React.useState(false);
  const remaining = MAX_DESCRIPTION - form.description.length;

  const resetAndClose = () => {
    setForm({ name: "", logo: "", description: "", category: "" });
    onOpenChange(false);
    setFullScreen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setForm({ name: "", logo: "", description: "", category: "" });
      setFullScreen(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={[
          "border-amber-100",
          fullScreen ? "max-w-[100vw] w-[100vw] h-[100dvh] rounded-none p-6 sm:p-8" : ""
        ].join(" ")}
      >
        <DialogHeader>
          <DialogTitle className="text-amber-800">{title}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className={fullScreen ? "flex flex-col gap-4 h-[calc(100dvh-160px)]" : "space-y-4"}
        >
          {/* Name */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-amber-700">Name</label>
          </div>
          <Input
            placeholder="Sponsor Name"
            value={form.name}
            onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
            required
          />

          {/* Description */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-amber-700">Description</label>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${remaining < 0 ? "text-red-600" : "text-amber-500"}`}>
                {form.description.length}/{MAX_DESCRIPTION}
              </span>
              <Button type="button" variant="outline" size="sm" onClick={() => setFullScreen(v => !v)}>
                {fullScreen ? "Minimize" : "Full Screen"}
              </Button>
            </div>
          </div>

          <div className={fullScreen ? "flex-1 min-h-0" : ""}>
            <Textarea
              placeholder="Sponsor Description"
              value={form.description}
              onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
              required
              maxLength={MAX_DESCRIPTION}
              className={[
                "leading-relaxed border-amber-200 focus:border-amber-500 focus:ring-amber-500 bg-white",
                fullScreen
                  ? "h-full min-h-0 resize-none overflow-auto"
                  : "min-h-24 max-h-96 overflow-auto resize-y"
              ].join(" ")}
              rows={fullScreen ? 18 : 4}
            />
          </div>

          {/* Category */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-amber-700">Category</label>
          </div>
          <Input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm(s => ({ ...s, category: e.target.value }))}
            required
          />

          {/* Logo */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-amber-700">Image URL</label>
          </div>
          <Input
            placeholder="Image URL"
            value={form.logo}
            onChange={(e) => setForm(s => ({ ...s, logo: e.target.value }))}
            required
          />

          {/* Footer */}
          <DialogFooter className={fullScreen ? "justify-end" : "gap-2"}>
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className={fullScreen ? "px-6 py-2.5" : ""}
              size={fullScreen ? "lg" : "default"}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`bg-amber-500 hover:bg-amber-700 text-white ${fullScreen ? "px-7 py-2.5" : ""}`}
              size={fullScreen ? "lg" : "default"}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") {
                  (e.currentTarget as HTMLButtonElement).form?.requestSubmit();
                }
              }}
            >
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};