"use client";

import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, LabelList, Cell
} from "recharts";

type Props = {
  data: Array<{ name: string; count: number }>;
  colors: string[];
};

export default function OverviewChart({ data, colors }: Props) {
  return (
    <div className="h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 24, left: 0, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickMargin={8} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Total Data" radius={[8, 8, 0, 0]}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
            ))}
            <LabelList dataKey="count" position="top" className="fill-slate-700 text-sm" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
