import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Notification } from "@/constant/notificationData";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  notification: Notification | null;
};

export const NotificationDialog: React.FC<Props> = ({ isOpen, onOpenChange, notification }) => {
  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-blue-100 max-w-4xl max-h-screen h-[90vh] overflow-hidden"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700 z-10"
        >
          <X className="text-2xl"/>
        </Button>

        <div className="flex flex-col gap-4 pr-2 max-h-[75vh]">
          <DialogHeader>
            <DialogTitle className="text-blue-800">{notification.title}</DialogTitle>
            <p className="text-xs text-blue-500 mt-1">{notification.time}</p>
          </DialogHeader>

          <div className="flex flex-col overflow-y-auto md:flex-row gap-4 items-start">
            {notification.icon && (
              <motion.img
                src={notification.icon}
                alt={notification.title}
                className="w-full md:w-[300px] h-auto object-contain rounded shadow-md"
              />
            )}

            <div className="text-blue-900 whitespace-pre-wrap">
              {notification.message}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
