import React, { useState } from "react";
import { motion } from "framer-motion";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { SponsorCardProps } from "@/constant/sponsorData";

export const SponsorsCard: React.FC<SponsorCardProps> = ({
  sponsor,
  onEdit,
  onDelete,
  onView,
}) => {
   const [isExpanded, setIsExpanded] = useState(false);
  
    const toggleExpand = () => setIsExpanded(!isExpanded);
  
  
    const shouldTruncate = sponsor.description.length > 50;
    const truncatedMessage = shouldTruncate
      ? `${sponsor.description.substring(0, 75)}...`
      : sponsor.description;
  
  return (
   <motion.div
         className="bg-white rounded-lg overflow-hidden border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
       >
         <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-2 ">
           <div className="flex items-center gap-3">
             <CardTitle className="text-lg font-medium text-amber-800">
               {sponsor.name}
               <p className="text-xs text-amber-400 -mt-1">{sponsor.category}</p>
                <p className="text-xs text-amber-500 mt-2">{sponsor.updatedAt}</p>
               
             </CardTitle>
           </div>
   
           <div className="flex gap-1">
             <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
               <Button variant="ghost" size="icon" onClick={onEdit} className="text-amber-600 hover:text-amber-800 hover:bg-amber-50">
                 <Pencil size={16} />
               </Button>
             </motion.div>
             <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
               <Button variant="ghost" size="icon" onClick={onDelete} className="text-amber-600 hover:text-amber-800 hover:bg-amber-50">
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
               src={sponsor.logo || "/placeholder.png"} // กัน null
               alt={sponsor.name}
               className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
               onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
             />
             <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
               <p className="text-white group-hover:underline transition-all duration-300">
                 {isExpanded ? sponsor.description : truncatedMessage}
               </p>
             </div>
           </div>
         </CardContent>
       </motion.div>
  );
};
