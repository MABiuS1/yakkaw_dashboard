// src/components/ClientLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // ใช้กับ App Router
import ClipLoader from "react-spinners/ClipLoader";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // เริ่มโหลด
    setLoading(true);
    // จำลอง delay ระหว่าง route change (อาจเปลี่ยน logic ตามการ fetch จริง)
    const timeout = setTimeout(() => setLoading(false), 450); // ปรับตามจริง

    return () => clearTimeout(timeout);
  }, [pathname]);

  return loading ? (
    <div className="flex items-center justify-center h-screen">
      <ClipLoader color="#36d7b7" size={50} />
    </div>
  ) : (
    <>{children}</>
  );
}
