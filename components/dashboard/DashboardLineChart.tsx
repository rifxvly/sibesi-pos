"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

export function DashboardLineChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} tickFormatter={(val) => `Rp ${val / 1000000}jt`} />
        <RechartsTooltip 
          formatter={(val: number) => formatCurrency(val)}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Line type="monotone" dataKey="total" stroke="#1c1917" strokeWidth={3} dot={{ r: 4, fill: '#1c1917', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
