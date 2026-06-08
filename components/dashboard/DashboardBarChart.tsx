"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

export function DashboardBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={36}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} tickFormatter={(val) => `Rp ${val / 1000000}jt`} />
        <RechartsTooltip 
          formatter={(val: number) => formatCurrency(val)}
          cursor={{ fill: '#f5f5f4' }}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Bar dataKey="total" fill="#2d3748" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
