import React, { useId } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { NewsFormDialogProps } from "@/constant/newsData";
import type { Category } from "@/constant/categoryData";

type Props = NewsFormDialogProps & {
  categories: Category[];
};

// --- Time helpers: แสดงเป็น local ใน input, เก็บเป็น ISO (UTC) ---
function toDatetimeLocalValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromDatetimeLocalValue(localStr: string) {
  if (!localStr) return "";
  return new Date(localStr).toISOString();
}

const MAX_DESC = 2000;

export function NewsFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  form,
  setForm,
  categories,
  title,
  submitButtonText,
}: Props) {
  const titleId = useId();
  const descId = useId();
  const imageId = useId();
  const urlId = useId();
  const categoryId = useId();
  const dateId = useId();

  const [fullScreen, setFullScreen] = React.useState(false);
  const remaining = MAX_DESC - (form.description?.length ?? 0);

  const resetAndClose = () => {
    setForm((s) => ({
      ...s,
      title: "",
      description: "",
      image: "",
      url: "",
      date: "",
      category_id: 0,
    }));
    setFullScreen(false);
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setForm((s) => ({
        ...s,
        title: "",
        description: "",
        image: "",
        url: "",
        date: "",
        category_id: 0,
      }));
      setFullScreen(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        // shadcn มี default sm:max-w-[425px]; เลยใส่ ! เพื่อ override ให้เต็มจอ
        className={[
          "border-purple-100",
          fullScreen
            ? "sm:!max-w-[100vw] sm:!w-[100vw] !h-[100dvh] !rounded-none !p-6 sm:!p-8 overflow-hidden"
            : ""
        ].join(" ")}
      >
        <DialogHeader>
          <DialogTitle className="text-purple-800">{title}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className={fullScreen ? "flex flex-col gap-4 h-[calc(100dvh-160px)]" : "space-y-4"}
        >
          {/* Title */}
          <div className="space-y-1">
            <label htmlFor={titleId} className="text-sm text-purple-700">Title</label>
            <Input
              id={titleId}
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              required
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          {/* Description + Fullscreen toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor={descId} className="text-sm text-purple-700">Description</label>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${remaining < 0 ? "text-red-600" : "text-purple-500"}`}>
                  {(form.description?.length ?? 0)}/{MAX_DESC}
                </span>
                <Button type="button" variant="outline" size="sm" onClick={() => setFullScreen((v) => !v)}>
                  {fullScreen ? "Minimize" : "Full Screen"}
                </Button>
              </div>
            </div>
            <div className={fullScreen ? "flex-1 min-h-0" : ""}>
              <Textarea
                id={descId}
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                required
                maxLength={MAX_DESC}
                className={[
                  "leading-relaxed border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white",
                  fullScreen ? "h-full min-h-0 resize-none overflow-auto" : "min-h-24 max-h-96 overflow-auto resize-y"
                ].join(" ")}
                rows={fullScreen ? 5 : 4}
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label htmlFor={imageId} className="text-sm text-purple-700">Image URL</label>
            <Input
              id={imageId}
              placeholder="https://example.com/image.jpg"
              value={form.image}
              onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
              required
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          {/* News URL */}
          <div className="space-y-1">
            <label htmlFor={urlId} className="text-sm text-purple-700">News URL</label>
            <Input
              id={urlId}
              placeholder="https://example.com/article"
              value={form.url}
              onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))}
              required
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label htmlFor={categoryId} className="text-sm text-purple-700">Category</label>
            <select
              id={categoryId}
              value={form.category_id}
              onChange={(e) => setForm((s) => ({ ...s, category_id: Number(e.target.value) }))}
              required
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value={0}>Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Publish Date (optional) */}
          <div className="space-y-1">
            <label htmlFor={dateId} className="text-sm text-purple-700">Publish Date (optional)</label>
            <Input
              id={dateId}
              type="datetime-local"
              value={toDatetimeLocalValue(form.date)}
              onChange={(e) => setForm((s) => ({ ...s, date: fromDatetimeLocalValue(e.target.value) }))}
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <DialogFooter className={fullScreen ? "justify-end gap-2" : "gap-2"}>
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
              className={`bg-purple-500 hover:bg-purple-700 text-white ${fullScreen ? "px-7 py-2.5" : ""}`}
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
}
