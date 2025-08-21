import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type FormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  form: { title: string; message: string; category: string; icon?: string };
  setForm: React.Dispatch<React.SetStateAction<{ title: string; message: string; category: string; icon?: string }>>;
  title: string;
  submitButtonText: string;
};

const MAX_MESSAGE = 2000;

export const FormDialog = ({
  isOpen, onOpenChange, onSubmit, form, setForm, title, submitButtonText,
}: FormDialogProps) => {
  const [fullScreen, setFullScreen] = React.useState(false);
  const remaining = MAX_MESSAGE - form.message.length;

  const resetAndClose = () => {
    setForm({ title: "", message: "", category: "", icon: "" });
    onOpenChange(false);
    setFullScreen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setForm({ title: "", message: "", category: "", icon: "" });
      setFullScreen(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={[
          "border-blue-100",
          fullScreen ? "max-w-[100vw] w-[100vw] h-[100dvh] rounded-none p-6 sm:p-8" : ""
        ].join(" ")}
      >
        {/* ใช้รูปแบบเดิม: Header ปกติ มี DialogTitle เสมอ */}
        <DialogHeader>
          <DialogTitle className="text-blue-800">{title}</DialogTitle>
        </DialogHeader>

        {/* ฟอร์ม: layout เดิมทั้งหมด */}
        <form
          onSubmit={onSubmit}
          className={fullScreen ? "flex flex-col gap-4 h-[calc(100dvh-160px)]" : "space-y-4"}
        >
          <div className="flex items-center justify-between">
            <label className="text-sm text-blue-700">Title</label>
          </div>
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))}
            required
          />

          <div className="flex items-center justify-between">
            <label className="text-sm text-blue-700">Description</label>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${remaining < 0 ? "text-red-600" : "text-blue-500"}`}>
                {form.message.length}/{MAX_MESSAGE}
              </span>
              <Button type="button" variant="outline" size="sm" onClick={() => setFullScreen(v => !v)}>
                {fullScreen ? "Minimize" : "Full Screen"}
              </Button>
            </div>
          </div>

          <div className={fullScreen ? "flex-1 min-h-0" : ""}>
            <Textarea
              placeholder="Description"
              value={form.message}
              onChange={(e) => setForm(s => ({ ...s, message: e.target.value }))}
              required
              maxLength={MAX_MESSAGE}
              className={[
                "leading-relaxed border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white",
                fullScreen
                  ? "h-full min-h-0 resize-none overflow-auto"
                  : "min-h-24 max-h-96 overflow-auto resize-y"
              ].join(" ")}
              rows={fullScreen ? 18 : 4}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-blue-700">Category</label>
          </div>
          <Input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm(s => ({ ...s, category: e.target.value }))}
            required
          />
          <div className="flex items-center justify-between">
            <label className="text-sm text-blue-700">Image URL</label>
          </div>
          <Input
            placeholder="Image URL "
            value={form.icon ?? ""}
            onChange={(e) => setForm(s => ({ ...s, icon: e.target.value }))}
            required
          />

          {/* Footer: โหมดเต็มจอเพิ่มพื้นที่โล่ง */}
          <DialogFooter
            className={
              fullScreen
                ? "justify-end"
                : "gap-2"
            }
          >
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
              className={`bg-blue-500 hover:bg-blue-700 text-white ${fullScreen ? "px-7 py-2.5" : ""}`}
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
