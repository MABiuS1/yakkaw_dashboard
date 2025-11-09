"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell, Calendar, Newspaper, FolderOpen, Gift,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotification";
import { useSponsors } from "@/hooks/useSponsor";
import { useNews } from "@/hooks/useNews";
import { useCategories } from "@/hooks/useCategories";
import Navbar from "@/components/ui/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
  Cell
} from "recharts";
import { StatCard } from "@/components/ui/statCard";
import dynamic from "next/dynamic";
const OverviewChart = dynamic(() => import("@/components/dashboard/OverviewChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full animate-pulse bg-slate-200 rounded" />
  ),
});



const DashboardPage = () => {
  const { filteredNotifications } = useNotifications();
  const { filteredSponsors } = useSponsors();
  const { filteredNews } = useNews();
  const { categories } = useCategories();

  // ตัวเลขสรุป
  const totalNotifications = filteredNotifications.length ?? 0;
  const totalSponsors = filteredSponsors.length ?? 0;
  const totalNews = filteredNews.length ?? 0;
  const totalCategories = categories.length ?? 0;

  // ข้อมูลกราฟเปรียบเทียบ
const compareData = useMemo(() => ([
  { name: "Notifications", count: totalNotifications },
  { name: "Sponsors", count: totalSponsors },
  { name: "News", count: totalNews },
  { name: "Categories", count: totalCategories },
]), [totalNotifications, totalSponsors, totalNews, totalCategories]);


  const barColors = ["#3b82f6", "#f59e0b", "#8b5cf6", "#10b981"]; // blue, amber, purple, emerald

  // แอนิเมชันเล็กน้อย
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-600 mt-1">All Information overview</p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-2 bg-white py-2 px-4 rounded-lg shadow-sm">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium text-slate-600">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </motion.div>

          {/* Stats Cards */}
          
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div variants={item}>
              <StatCard
                title="Notifications"
                value={totalNotifications}
                subtitle="Total notifications"
                icon={Bell}
                color="blue"
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                title="Sponsors"
                value={totalSponsors}
                subtitle="Total sponsors"
                icon={Gift}
                color="amber"
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                title="News"
                value={totalNews}
                subtitle="Total news"
                icon={Newspaper}
                color="purple"
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                title="Categories"
                value={totalCategories}
                subtitle="Total categories"
                icon={FolderOpen}
                color="emerald"
              />
            </motion.div>
          </motion.div>


          {/* Content Section */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-slate-800">Overview Comparison</CardTitle>
              </CardHeader>
              <CardContent className="h-[380px]">
                <OverviewChart data={compareData} colors={barColors} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-12 text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} Yakkaw. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default DashboardPage;
