"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function SalesChart({
  data
}: {
  data: {
    day: string;
    total: number;
  }[];
}) {
  return (
    <Card className="h-full">
      <CardTitle>Grafik Penjualan 7 Hari</CardTitle>
      <CardDescription className="mt-2">Pantau ritme transaksi untuk melihat tren toko secara cepat.</CardDescription>
      <div className="mt-6 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <XAxis dataKey="day" stroke="#78716c" />
            <YAxis stroke="#78716c" tickFormatter={(value) => `${Math.round(value / 1000000)}jt`} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#e7e5e4",
                borderRadius: 16
              }}
            />
            <Bar dataKey="total" fill="#1c1917" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
