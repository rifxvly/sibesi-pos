"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const steps = [
  "Data Pelanggan",
  "Daftar Material",
  "Ketentuan",
  "Review & Submit"
];

export function ContractForm() {
  const [step, setStep] = useState(0);

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card>
        <CardTitle>Alur Kontrak</CardTitle>
        <CardDescription className="mt-2">Kasir menyiapkan draft, admin memvalidasi dan approve.</CardDescription>
        <div className="mt-6 space-y-3">
          {steps.map((label, index) => (
            <button
              key={label}
              onClick={() => setStep(index)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
                step === index
                  ? "border-amber-400 bg-amber-500/10 text-amber-200"
                  : "border-slate-800 bg-slate-950/40 text-slate-300"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold">
                {index + 1}
              </span>
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>{steps[step]}</CardTitle>
        <CardDescription className="mt-2">Field inti sudah disiapkan agar sesuai PRD dan ERD.</CardDescription>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input placeholder="Nama pelanggan / perusahaan" />
          <Input placeholder="Telepon" />
          <Input placeholder="Email" />
          <Input placeholder="NPWP (terenkripsi saat simpan)" />
          <Input className="md:col-span-2" placeholder="Alamat pengiriman" />
          <Input placeholder="Jadwal kirim" type="date" />
          <Input placeholder="Tempo pembayaran (hari)" type="number" />
          <Input placeholder="DP nominal" type="number" />
          <Input placeholder="DP persen" type="number" />
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
            Kembali
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary">Simpan Draft</Button>
            <Button onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}>
              {step === steps.length - 1 ? "Submit Review" : "Lanjut"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
