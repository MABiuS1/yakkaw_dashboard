// ประเภทข้อมูลหลัก
export type Sponsor = {
  id: number;
  name: string;
  logo: string;        // URL ของโลโก้
  description: string; // รายละเอียด
  category: string;    // ประเภท
  time?: string; // ใช้สำหรับแสดงใน UI เตรียมไว้ก่อน ถ้าไม่ใช้ก็ไม่ต้องใส่ !!!
  createdAt?: string;
  updatedAt?: string;
};

// ค่าเริ่มต้น (สำหรับ reset form หรือกรณีที่ยังไม่มีข้อมูล)
export const EMPTY_SPONSOR: Sponsor = {
  id: 0,
  name: "",
  logo: "",
  description: "",
  category: "",
};

// สำหรับฟอร์ม (ไม่ต้องมี id/createdAt/updatedAt)
export type SponsorForm = {
  name: string;
  logo: string;
  description: string;
  category: string;
};

// Props ของ Dialog ฟอร์ม (เหมือน Notification แต่เปลี่ยนเป็น Sponsor)
export type SponsorFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;

  form: SponsorForm;
  setForm: React.Dispatch<React.SetStateAction<SponsorForm>>;

  title: string;
  submitButtonText: string;
};

// Props ของ Card (ใช้แสดง sponsor ทีละตัว)
export type SponsorCardProps = {
  sponsor: Sponsor;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
};