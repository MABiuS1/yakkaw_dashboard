export type Notification = {
  id: number;               
  title: string;
  message: string;
  category: string;
  icon?: string;
  createdAt?: string;       
  updatedAt?: string;
  time?: string; // ใช้สำหรับแสดงใน UI
};

export const EMPTY_NOTIFICATION: Notification = {
  id: 0,                     
  title: "",
  message: "",
  category: "",
  icon: "",
};

// สำหรับฟอร์ม (ไม่ต้องมี id/createdAt)
export type NotificationForm = {
  title: string;
  message: string;
  category: string;
  icon?: string;
};

export type FormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;

  // เปลี่ยนจาก notification/setNotification -> form/setForm
  form: NotificationForm;
  setForm: React.Dispatch<React.SetStateAction<NotificationForm>>;

  title: string;
  submitButtonText: string;
};

export type NotificationCardProps = {
  notification: Notification;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
};