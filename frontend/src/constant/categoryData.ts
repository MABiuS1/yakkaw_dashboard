// categoryData.ts
export type Category = {
  id: number;
  name: string;
  // news?: News[]; // <- เพิ่มได้เมื่อมี News type แล้ว
};

export const EMPTY_CATEGORY: Category = {
  id: 0,
  name: "",
};

export type CategoryForm = {
  name: string;
};

// Dialog Props (สอดคล้องกับ pattern form/setForm)
export type CategoryFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;

  form: CategoryForm;
  setForm: React.Dispatch<React.SetStateAction<CategoryForm>>;

  title: string;
  submitButtonText: string;
};

export type CategoryCardProps = {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
};