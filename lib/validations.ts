import { MetodeBayar, StatusKontrak } from "@prisma/client";
import { z } from "zod";

export const productSchema = z.object({
  kodeBarang: z.string().min(3).max(20),
  nama: z.string().min(3).max(100),
  kategori: z.enum(["BESI", "SEMEN", "PASIR", "CAT", "PAKU", "ALAT", "LAIN"]),
  satuan: z.string().min(1).max(20),
  hargaJual: z.coerce.number().min(0),
  hargaPokok: z.coerce.number().min(0).optional().nullable(),
  stok: z.coerce.number().min(0),
  stokMinimum: z.coerce.number().min(0),
  gambar: z.string().url().optional().nullable()
});

export const transactionItemSchema = z.object({
  productId: z.string().min(1),
  nama: z.string().min(1),
  jumlah: z.coerce.number().positive(),
  satuan: z.string().min(1),
  hargaSatuan: z.coerce.number().min(0),
  subtotal: z.coerce.number().min(0)
});

export const transactionSchema = z.object({
  customerId: z.string().optional().nullable(),
  diskon: z.coerce.number().min(0).default(0),
  metodeBayar: z.nativeEnum(MetodeBayar),
  uangDiterima: z.coerce.number().min(0).optional().nullable(),
  catatan: z.string().optional().nullable(),
  items: z.array(transactionItemSchema).min(1)
});

export const contractSchema = z.object({
  customerId: z.string().min(1),
  transactionId: z.string().optional().nullable(),
  alamatKirim: z.string().min(5),
  jadwalKirim: z.string().optional().nullable(),
  tempoPembayaran: z.coerce.number().int().min(0).max(365),
  dp: z.coerce.number().min(0).optional().nullable(),
  dpPersen: z.coerce.number().min(0).max(100).optional().nullable(),
  catatanAdmin: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        spesifikasi: z.string().optional().nullable(),
        jumlah: z.coerce.number().positive(),
        satuan: z.string().min(1),
        hargaSatuan: z.coerce.number().min(0),
        subtotal: z.coerce.number().min(0)
      })
    )
    .min(1)
});

export const approveContractSchema = z.object({
  status: z.enum([StatusKontrak.APPROVED, StatusKontrak.REJECTED]),
  catatanAdmin: z.string().optional().nullable()
});

export const customerSchema = z.object({
  nama: z.string().min(3).max(100),
  tipe: z.enum(["PERORANGAN", "PERUSAHAAN"]),
  perusahaan: z.string().max(120).optional().nullable(),
  npwp: z.string().max(40).optional().nullable(),
  alamat: z.string().min(5).max(255).optional().nullable(),
  telepon: z.string().min(8).max(20).optional().nullable(),
  email: z.string().email().optional().nullable()
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  jumlah: z.coerce.number().positive(),
  keterangan: z.string().min(3),
  tipe: z.enum(["IN", "OUT", "ADJUSTMENT"]).default("ADJUSTMENT")
});
