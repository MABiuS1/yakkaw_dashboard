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

export const NewsFormDialog: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  form,
  setForm,
  categories,
  title,
  submitButtonText,
}) => {
  // Accessible ids for labels/inputs
  const titleId = useId();
  const descId = useId();
  const imageId = useId();
  const urlId = useId();
  const categoryId = useId();
  const dateId = useId();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-purple-100">
        <DialogHeader>
          <DialogTitle className="text-purple-800">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label htmlFor={titleId} className="text-sm text-purple-700">
              Title
            </label>
            <Input
              id={titleId}
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              required
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor={descId} className="text-sm text-purple-700">
              Description
            </label>
            <Textarea
              id={descId}
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              required
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label htmlFor={imageId} className="text-sm text-purple-700">
              Image URL
            </label>
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
            <label htmlFor={urlId} className="text-sm text-purple-700">
              News URL
            </label>
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
            <label htmlFor={categoryId} className="text-sm text-purple-700">
              Category
            </label>
            <select
              id={categoryId}
              value={form.category_id}
              onChange={(e) => setForm((s) => ({ ...s, category_id: Number(e.target.value) }))}
              required
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value={0}>Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date (optional) */}
          <div className="space-y-1">
            <label htmlFor={dateId} className="text-sm text-purple-700">
              Publish Date (optional)
            </label>
            <Input
              id={dateId}
              type="datetime-local"
              value={form.date ? new Date(form.date).toISOString().slice(0, 16) : ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, date: new Date(e.target.value).toISOString() }))
              }
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-500 hover:bg-purple-700 text-white">
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
