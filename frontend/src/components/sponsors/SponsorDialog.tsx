import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sponsor } from "@/constant/sponsorData";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sponsor: Sponsor | null;
};

export const SponsorDialog = ({ isOpen, onOpenChange, sponsor }:Props) => {
  if (!sponsor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* 1. DialogContent: ลบ h-[90vh] และ overflow-hidden ออก เพื่อให้ Dialog ปรับขนาดตามเนื้อหา */}
      <DialogContent className="border-amber-100 p-7 max-w-5xl h-[40vh] flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 text-red-500 hover:text-red-700 z-10"
          aria-label="Close dialog"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* 2. Container: ปรับให้มีการเลื่อนอัตโนมัติหากเนื้อหายาวเกินไป */}
        <div className="flex flex-col gap-4 pr-2 max-h-[85vh] overflow-y-auto"> 
          
          <DialogHeader className="pb-2">
            {/* ⬇️ เพิ่ม Label นำหน้าชื่อ */}
            <DialogTitle className="text-amber-800">
                <span className="text-gray-500 font-normal text-sm mr-2">Name:</span> 
                {sponsor.name}
            </DialogTitle>
             {/* ⬇️ เพิ่ม Label นำหน้า Category */}
             <DialogDescription className="text-amber-600">
                <span className="text-gray-500 font-normal text-sm mr-2">Category:</span>
                {sponsor.category}
            </DialogDescription>
          </DialogHeader>

          {/* 3. เนื้อหา: รูปลอยซ้าย + ข้อความล้อมรูป */}
          <div className="md:after:content-[''] md:after:block md:after:clear-both">
            {sponsor.logo && (
              <motion.img
                src={sponsor.logo}
                alt={sponsor.name}
                className="
                  w-full h-auto object-cover rounded shadow-md mb-4
                  md:float-left 
                  md:w-[500px] {{-- ⬅️ ปรับความกว้างจาก 320px เป็น 500px เพื่อให้ภาพใหญ่ขึ้น --}}
                  md:max-w-[60%] {{-- ⬅️ ปรับ max-width เป็น 60% เพื่อให้ภาพกว้างขึ้น --}}
                  md:mr-6 md:mb-4
                "
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}

            <div className="text-amber-900 whitespace-pre-wrap leading-relaxed">
                {/* ⬇️ เพิ่ม Label นำหน้า Description */}
                <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-4 md:mt-0">Description:</h3>
                {sponsor.description}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};