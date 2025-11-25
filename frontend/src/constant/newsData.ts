import type { Category } from "@/constant/categoryData";

/** ข้อมูลข่าวจาก backend (สอดคล้องกับ Go model) */
export type News = {
  id: number;
  title: string;
  description: string;
  image: string;     // URL รูปภาพ
  url: string;       // ลิงก์ต้นฉบับ/อ่านต่อ
  date: string;      // ISO string เช่น "2025-08-17T12:00:00Z"

  category_id: number;
  category?: Category | null;

  createdAt?: string; // ถ้า backend ส่งมา (ออปชัน)
  updatedAt?: string; // ถ้า backend ส่งมา (ออปชัน)
};

/** ค่า default สำหรับ reset/initial state */
export const EMPTY_NEWS: News = {
  id: 0,
  title: "",
  description: "",
  image: "",
  url: "",
  date: new Date().toISOString(),
  category_id: 0,
  category: null,
};

/** แบบฟอร์มสำหรับ create/update (ไม่ต้องมี id/createdAt/updatedAt) */
export type NewsForm = {
  title: string;
  description: string;
  image: string;
  url: string;
  date: string;       // ISO string
  category_id: number;
};

/** Props สำหรับ Dialog ฟอร์ม (ถ้าจะใช้ component แบบเดียวกับที่ใช้ใน Sponsor/Category) */
export type NewsFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;

  form: NewsForm;
  setForm: React.Dispatch<React.SetStateAction<NewsForm>>;

  title: string;
  submitButtonText: string;
};

/** Props สำหรับ Card แสดงข่าว */
export type NewsCardProps = {
  news: News;
  onEdit: () => void;
  onDelete: () => void;
};