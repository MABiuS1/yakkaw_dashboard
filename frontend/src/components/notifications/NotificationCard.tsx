/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { NotificationCardProps } from "@/constant/notificationData";
import { FormDialog } from "./FormNotificationDialog";

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onEdit, onDelete, onView }) => {
  const [isExpanded, setIsExpanded] = useState(false);



  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine if message needs truncation
  const shouldTruncate = notification.message.length > 50;
  const truncatedMessage = shouldTruncate 
    ? `${notification.message.substring(0,75)}...` 
    : notification.message;

  return (

    <motion.div

      className="bg-white rounded-lg overflow-hidden border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"

    >

      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-2 ">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-medium text-blue-800">{notification.title}
            <p className="text-xs text-blue-500 mt-2">
              {notification.time}
            </p></CardTitle>
        </div>

        <div className="flex gap-1" >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} >
            <Button variant="ghost" size="icon" onClick={onEdit} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
              <Pencil size={16} />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
              <Trash2 size={16} />
            </Button>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-0">
  <div
    className="relative w-full h-48 cursor-pointer group overflow-hidden rounded-b-lg"
    onClick={onView}
  >
    <motion.img
      src={notification.icon}
      alt={notification.title}
      className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
    />
    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
      <p className="text-white group-hover:underline transition-all duration-300">
        {isExpanded ? notification.message : truncatedMessage}
      </p>
    </div>
  </div>
</CardContent>

    </motion.div>
  );
};
