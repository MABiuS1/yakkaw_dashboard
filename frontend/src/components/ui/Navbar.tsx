"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, LogOut, Home, Bell, Gift, Newspaper, FolderOpen } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const DESKTOP_LINKS: NavItem[] = [
  { href: "/categories", icon: FolderOpen, label: "Categories" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/sponsor", icon: Gift, label: "Sponsor" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/ColorRangeePage", icon: FolderOpen, label: "ColorRange" },
  { href: "/DevicePage", icon: FolderOpen, label: "DevicePage" },
];

const MOBILE_LINKS: NavItem[] = [{ href: "/dashboard", icon: Home, label: "Dashboard" }, ...DESKTOP_LINKS];

const Navbar = () => {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUsername = getCookie("username") || "Admin";
    setUsername(storedUsername);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8080/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  const DesktopNav = () => (
  <nav className="hidden lg:flex h-16 items-stretch gap-1 xl:gap-2" aria-label="Primary">
    {DESKTOP_LINKS.map((link) => {
      const Icon = link.icon;
      const active = isActive(link.href);

      return (
        <Link
          key={link.href}
          href={link.href}
          aria-current={active ? "page" : undefined}
          className="relative inline-flex items-stretch"
        >
          <motion.div
            whileTap={{ scale: 0.98 }}
            className={[
              // ทำให้ปุ่มสูงเท่า navbar และมี padding เท่ากันทุกอัน -> เส้นใต้จะสมมาตร
              "relative flex items-center h-16 px-4 xl:px-5",
              "text-sm xl:text-[15px] font-medium",
              active ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
            ].join(" ")}
          >
            <Icon className="h-5 w-5 mr-2.5 opacity-90" />
            {link.label}

            {/* เส้นใต้แบบเลื่อนด้วย layoutId (กว้างเท่าปุ่ม) */}
            {active && (
              <motion.span
                layoutId="nav-underline"              // <<< magic: ทำให้เส้นเดียวกันย้ายตำแหน่งลื่น ๆ
                className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full bg-rose-600"
                transition={{ type: "spring", stiffness: 500, damping: 34, mass: 0.4 }}
              />
            )}
          </motion.div>
        </Link>
      );
    })}
  </nav>
);


  const MobileNavSheet = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex items-center justify-center -mb-5">
            <motion.img
              src="/assets/yakkaw_icon.png"
              alt="LOGO"
              className="rounded-full object-contain"
              width={140}
              height={140}
            />
          </div>
        </SheetHeader>

        <div className="py-4">
          <div className="space-y-1">
            {MOBILE_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={[
  "relative flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-lg transition-colors",
  active
    ? "text-rose-700 bg-rose-50"
    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
].join(" ")}
>
  {active && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-600 rounded-l-lg" />}
                    <Icon className="h-5 w-5 mr-2.5 opacity-90" />
                    <span>{link.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-4 border-t pt-4">
          <Avatar className="h-10 w-10 ring-1 ring-rose-200">
            <AvatarImage src="/placeholder-avatar.jpg" alt={username} />
            <AvatarFallback className="bg-gradient-to-br from-rose-500 to-rose-700 text-white">
              {username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{username}</p>
            <p className="text-xs text-muted-foreground truncate">admin@yakkaw.com</p>
          </div>
          <Button variant="destructive" size="icon" onClick={handleLogout} aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70 shadow-lg overflow-x-clip">
      {/* top accent bar — เปลี่ยนเป็นโทน rose */}
      <div className="pointer-events-none h-[3px] bg-gradient-to-r from-transparent via-rose-500/80 to-transparent" />
      <div className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/dashboard" className="flex items-center">
              <motion.img
                src="/assets/yakkaw_icon.png"
                alt="LOGO"
                className="rounded-full object-contain"
                width={90}
                height={40}
                whileHover={{ rotate: 2, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              />
            </Link>
          </div>

          {/* Desktop Nav (≥ lg) */}
          <DesktopNav />

          {/* Right side: pill โปรไฟล์ โทน rose */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-rose-200 bg-white/70 pl-3 pr-1 py-1 shadow-sm">
              <span className="text-sm font-medium text-slate-700 max-w-[160px] truncate">{username}</span>
              <span className="mx-1 h-5 w-px bg-rose-200" />
              <Button
                variant="destructive"
                size="icon"
                onClick={handleLogout}
                aria-label="Logout"
                className="shadow-xs rounded-full hover:shadow"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile / Tablet */}
            <div className="lg:hidden">
              <MobileNavSheet />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
