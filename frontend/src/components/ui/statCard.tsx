import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color: "blue" | "amber" | "purple" | "emerald";
};

const colorMap = {
  blue:   { iconBg: "bg-blue-50",   iconText: "text-blue-600",   bar: "bg-blue-500/15"   },
  amber:  { iconBg: "bg-amber-50",  iconText: "text-amber-600",  bar: "bg-amber-500/15"  },
  purple: { iconBg: "bg-purple-50", iconText: "text-purple-600", bar: "bg-purple-500/15" },
  emerald:{ iconBg: "bg-emerald-50",iconText: "text-emerald-600",bar: "bg-emerald-500/15"},
};

export const StatCard = ({ title, value, subtitle, icon: Icon, color }:StatCardProps) => {
  const c = colorMap[color];
  return (
    <div
      tabIndex={0}
      className="group rounded-2xl p-[1px] bg-gradient-to-br from-slate-200 via-slate-100 to-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
      role="region"
      aria-label={`${title} card`}
    >
      <div className="rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 min-h-[140px]">
        <div className="flex items-center gap-4 p-5">
          <div className={`h-12 w-12 ${c.iconBg} rounded-full flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${c.iconText}`} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-slate-800 truncate">{value}</span>
            </div>
            {subtitle ? (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {/* แถบตกแต่งด้านล่างเพื่อความสมมาตรสายตา */}
        <div className={`h-6 w-full ${c.bar} rounded-b-2xl`} />
      </div>
    </div>
  );
};
