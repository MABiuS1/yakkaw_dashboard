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
      <DialogContent className="border-amber-100 p-7 max-w-4xl max-h-screen h-[90vh] overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 text-red-500 hover:text-red-700 z-10"
        >
          <X className="text-2xl" />
        </Button>

        <div className="flex flex-col gap-4 pr-2 max-h-[75vh]">
          <DialogHeader>
            <DialogTitle className="text-amber-800">{sponsor.name}</DialogTitle>
             <DialogDescription className="text-amber-600">Category: {sponsor.category}</DialogDescription>
            <p className="text-xs text-amber-500 mt-1">{sponsor.time}</p>
          </DialogHeader>

          {/* เนื้อหา: รูปลอยซ้าย + ข้อความล้อมรูป */}
          <div className="overflow-y-auto md:after:content-[''] md:after:block md:after:clear-both">
            {sponsor.logo && (
              <motion.img
                src={sponsor.logo}
                alt={sponsor.name}
                className="
                  w-full h-auto object-cover rounded shadow-md
                  md:float-left md:w-80 md:max-w-[40%] md:mr-6 md:mb-4
                "
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}

            <div className="text-amber-900 whitespace-pre-wrap leading-relaxed">
              {sponsor.description}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
