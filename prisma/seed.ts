import { KategoriProduk, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Users ───────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const kasirPassword = await bcrypt.hash("Kasir123!", 10);

  const existingAdmin = await prisma.user.findFirst({ where: { username: "admin" } });
  const admin = existingAdmin ?? await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      username: "admin",
      email: "admin@sibesi.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isActive: true,
      updatedAt: new Date()
    }
  });

  const existingKasir = await prisma.user.findFirst({ where: { username: "kasir1" } });
  const kasir1 = existingKasir ?? await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      username: "kasir1",
      email: "kasir1@sibesi.com",
      passwordHash: kasirPassword,
      role: Role.KASIR,
      isActive: true,
      updatedAt: new Date()
    }
  });

  console.log(`  ✅ Users: ${admin.username}, ${kasir1.username}`);

  // ─── Products ────────────────────────────────────────
  const products = [
    {
      kodeBarang: "BSI-001",
      nama: "Besi Beton 10mm",
      kategori: "BESI",
      satuan: "batang",
      hargaJual: 55000,
      hargaPokok: 45000,
      stok: 500,
      stokMinimum: 50
    },
    {
      kodeBarang: "BSI-002",
      nama: "Besi Beton 12mm",
      kategori: "BESI",
      satuan: "batang",
      hargaJual: 80000,
      hargaPokok: 65000,
      stok: 400,
      stokMinimum: 50
    },
    {
      kodeBarang: "BSI-003",
      nama: "Besi Hollow 4x4",
      kategori: "BESI",
      satuan: "batang",
      hargaJual: 120000,
      hargaPokok: 95000,
      stok: 200,
      stokMinimum: 30
    },
    {
      kodeBarang: "SMN-001",
      nama: "Semen Portland 50kg",
      kategori: "SEMEN",
      satuan: "sak",
      hargaJual: 70000,
      hargaPokok: 58000,
      stok: 1000,
      stokMinimum: 100
    },
    {
      kodeBarang: "SMN-002",
      nama: "Semen Putih 50kg",
      kategori: "SEMEN",
      satuan: "sak",
      hargaJual: 85000,
      hargaPokok: 72000,
      stok: 300,
      stokMinimum: 50
    },
    {
      kodeBarang: "PSR-001",
      nama: "Pasir Halus",
      kategori: "PASIR",
      satuan: "m3",
      hargaJual: 350000,
      hargaPokok: 280000,
      stok: 50,
      stokMinimum: 10
    },
    {
      kodeBarang: "PSR-002",
      nama: "Pasir Beton",
      kategori: "PASIR",
      satuan: "m3",
      hargaJual: 300000,
      hargaPokok: 240000,
      stok: 80,
      stokMinimum: 10
    },
    {
      kodeBarang: "CAT-001",
      nama: "Cat Tembok Putih 20L",
      kategori: "CAT",
      satuan: "kaleng",
      hargaJual: 450000,
      hargaPokok: 380000,
      stok: 100,
      stokMinimum: 20
    },
    {
      kodeBarang: "CAT-002",
      nama: "Cat Tembok Cream 20L",
      kategori: "CAT",
      satuan: "kaleng",
      hargaJual: 475000,
      hargaPokok: 400000,
      stok: 80,
      stokMinimum: 20
    },
    {
      kodeBarang: "PKU-001",
      nama: "Paku Biasa 5cm",
      kategori: "PAKU",
      satuan: "kg",
      hargaJual: 18000,
      hargaPokok: 14000,
      stok: 200,
      stokMinimum: 30
    },
    {
      kodeBarang: "PKU-002",
      nama: "Paku Beton 7cm",
      kategori: "PAKU",
      satuan: "kg",
      hargaJual: 22000,
      hargaPokok: 17000,
      stok: 150,
      stokMinimum: 30
    },
    {
      kodeBarang: "ALT-001",
      nama: "Palu Besi 1kg",
      kategori: "ALAT",
      satuan: "pcs",
      hargaJual: 85000,
      hargaPokok: 65000,
      stok: 50,
      stokMinimum: 10
    },
    {
      kodeBarang: "ALT-002",
      nama: "Gergaji Besi",
      kategori: "ALAT",
      satuan: "pcs",
      hargaJual: 125000,
      hargaPokok: 95000,
      stok: 30,
      stokMinimum: 5
    },
    {
      kodeBarang: "LAIN-001",
      nama: "Kawat Ikat",
      kategori: "LAIN",
      satuan: "roll",
      hargaJual: 35000,
      hargaPokok: 25000,
      stok: 100,
      stokMinimum: 20
    },
    {
      kodeBarang: "LAIN-002",
      nama: "Seng Gelombang",
      kategori: "LAIN",
      satuan: "lembar",
      hargaJual: 95000,
      hargaPokok: 75000,
      stok: 60,
      stokMinimum: 10
    }
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { kodeBarang: product.kodeBarang }
    });
    if (!existing) {
      await prisma.product.create({
        data: { ...product, kategori: product.kategori as KategoriProduk, id: crypto.randomUUID(), updatedAt: new Date() }
      });
    }
  }

  console.log(`  ✅ Products: ${products.length} items`);

  // ─── Customers ───────────────────────────────────────
  const customers = [
    {
      nama: "Toko Bangunan Jaya",
      tipe: "PERUSAHAAN" as const,
      perusahaan: "PT Jaya Bangun Sentosa",
      telepon: "021-5551234",
      email: "info@jayabangun.co.id"
    },
    {
      nama: "Budi Santoso",
      tipe: "PERORANGAN" as const,
      telepon: "0812-3456-7890",
      email: "budi.santoso@gmail.com"
    },
    {
      nama: "CV Maju Bersama",
      tipe: "PERUSAHAAN" as const,
      perusahaan: "CV Maju Bersama",
      telepon: "021-5559876",
      email: "order@majubersama.co.id"
    }
  ];

  for (const customer of customers) {
    const existing = await prisma.customer.findFirst({
      where: { nama: customer.nama }
    });

    if (!existing) {
      await prisma.customer.create({ data: { ...customer, id: crypto.randomUUID() } });
    }
  }

  console.log(`  ✅ Customers: ${customers.length} items`);

  console.log("\n🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
