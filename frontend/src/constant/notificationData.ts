export type Notification = {
    id: string | null;
    title: string;
    message: string;
    icon: string;
    category?: string;
    time?: string;
  }

export type FormDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    notification: Notification;
    setNotification: React.Dispatch<React.SetStateAction<Notification>>;
    title: string;
    submitButtonText: string;
  }

export type NotificationCardProps = {
    notification: Notification;
    onEdit: () => void;
    onDelete: () => void;
    onView?: () => void;
  }
