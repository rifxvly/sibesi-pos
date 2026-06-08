import { PrismaClient, Role, StatusKontrak } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding 15 Suppliers + Contracts...");

  const supplierPassword = await bcrypt.hash("Supplier123!", 10);
  const now = new Date();

  // ─── 15 Suppliers (DK01-DK15) ─────────────────────────
  const suppliers = [
    { kode: "DK01", nama: "PT Besi Jaya Abadi", alamat: "Jl. Industri Timur No. 10, Jakarta Utara", telepon: "021-4567890", email: "info@besijaya.co.id", npwp: "01.234.567.8-012.000", kontakPerson: "Budi Hartono", spesialisasi: "Besi & Baja" },
    { kode: "DK02", nama: "CV Semen Murah Jaya", alamat: "Jl. Raya Bogor Km 25, Bogor", telepon: "0251-1234567", email: "sales@semenmurah.co.id", npwp: "02.345.678.9-013.000", kontakPerson: "Siti Rahayu", spesialisasi: "Semen" },
    { kode: "DK03", nama: "PT Pasir Indah Perkasa", alamat: "Jl. Cikampek No. 55, Karawang", telepon: "0267-8765432", email: "order@pasirindah.co.id", npwp: "03.456.789.0-014.000", kontakPerson: "Ahmad Fauzi", spesialisasi: "Pasir & Agregat" },
    { kode: "DK04", nama: "Toko Cat Dewi", alamat: "Jl. Pahlawan No. 12, Bandung", telepon: "022-9876543", email: "tokocatdewi@gmail.com", npwp: "04.567.890.1-015.000", kontakPerson: "Dewi Sartika", spesialisasi: "Cat & Finishing" },
    { kode: "DK05", nama: "CV Paku Indonesia", alamat: "Jl. Industri Selatan No. 8, Sidoarjo", telepon: "031-8761234", email: "cvpakuindo@yahoo.com", npwp: "05.678.901.2-016.000", kontakPerson: "Rudi Santoso", spesialisasi: "Paku & Fastener" },
    { kode: "DK06", nama: "PT Alat Teknik Mandiri", alamat: "Jl. Pemuda No. 99, Surabaya", telepon: "031-5432198", email: "info@alatteknik.co.id", npwp: "06.789.012.3-017.000", kontakPerson: "Hendra Wijaya", spesialisasi: "Alat Teknik" },
    { kode: "DK07", nama: "Distributor Material Bangunan Jaya", alamat: "Jl. Gajah Mada No. 33, Semarang", telepon: "024-6543210", email: "materialjaya@gmail.com", npwp: "07.890.123.4-018.000", kontakPerson: "Agus Setiawan", spesialisasi: "Multi Material" },
    { kode: "DK08", nama: "PT Baja Konstruksi Indonesia", alamat: "Jl. Gatot Subroto No. 45, Yogyakarta", telepon: "0274-3216549", email: "bajakonstruksi@ymail.com", npwp: "08.901.234.5-019.000", kontakPerson: "Dwi Prasetyo", spesialisasi: "Baja Konstruksi" },
    { kode: "DK09", nama: "CV Sumber Bangunan", alamat: "Jl. Ahmad Yani No. 77, Malang", telepon: "0341-7654321", email: "sumberbangunan@gmail.com", npwp: "09.012.345.6-020.000", kontakPerson: "Eko Prasetyo", spesialisasi: "Material Umum" },
    { kode: "DK10", nama: "PT Logam Mulia Persada", alamat: "Jl. Raya Pluit No. 20, Jakarta Utara", telepon: "021-6677889", email: "logammulia@outlook.com", npwp: "10.123.456.7-021.000", kontakPerson: "Firman Hakim", spesialisasi: "Logam & Besi" },
    { kode: "DK11", nama: "Toko Bangunan Harapan", alamat: "Jl. Pahlawan No. 5, Bekasi", telepon: "021-8899001", email: "toko_harapan@gmail.com", npwp: "11.234.567.8-022.000", kontakPerson: "Gilang Ramadhan", spesialisasi: "Bangunan Umum" },
    { kode: "DK12", nama: "CV Mitra Konstruksi Sejahtera", alamat: "Jl. Thamrin No. 15, Depok", telepon: "021-7788990", email: "mitrakonstruksi@yahoo.com", npwp: "12.345.678.9-023.000", kontakPerson: "Hadi Kurniawan", spesialisasi: "Konstruksi" },
    { kode: "DK13", nama: "PT Sumber Daya Material", alamat: "Jl. Asia Afrika No. 88, Bandung", telepon: "022-4455667", email: "sumberdayamaterial@gmail.com", npwp: "13.456.789.0-024.000", kontakPerson: "Indra Lesmana", spesialisasi: "Material Premium" },
    { kode: "DK14", nama: "Distributor Besi Nusantara", alamat: "Jl. Pemuda No. 22, Tangerang", telepon: "021-3344556", email: "besinusantara@gmail.com", npwp: "14.567.890.1-025.000", kontakPerson: "Joko Widodo", spesialisasi: "Besi Nusantara" },
    { kode: "DK15", nama: "CV Berkah Bangunan", alamat: "Jl. Veteran No. 30, Tangerang Selatan", telepon: "021-2233445", email: "berkahbangunan@outlook.com", npwp: "15.678.901.2-026.000", kontakPerson: "Kurniawan Dwi", spesialisasi: "Bahan Bangunan" }
  ];

  const createdSuppliers = [];
  for (const s of suppliers) {
    const existing = await prisma.supplier.findFirst({ where: { kode: s.kode } });
    if (!existing) {
      const supplier = await prisma.supplier.create({
        data: {
          id: crypto.randomUUID(),
          kode: s.kode,
          nama: s.nama,
          alamat: s.alamat,
          telepon: s.telepon,
          email: s.email,
          npwp: s.npwp,
          kontakPerson: s.kontakPerson,
          spesialisasi: s.spesialisasi,
          isActive: true,
          updatedAt: now
        }
      });
      createdSuppliers.push(supplier);
    } else {
      createdSuppliers.push(existing);
    }
  }
  console.log(`  ✅ Suppliers: ${createdSuppliers.length} items (DK01-DK15)`);

  // ─── 15 Supplier Users ─────────────────────────────────
  const supplierUsers = [];
  for (let i = 0; i < createdSuppliers.length; i++) {
    const s = createdSuppliers[i];
    const username = `supplier${String(i + 1).padStart(2, "0")}`;
    const existingUser = await prisma.user.findFirst({ where: { username } });
    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          username,
          email: s.email ?? `supplier${i + 1}@sibesi.com`,
          passwordHash: supplierPassword,
          role: Role.SUPPLIER,
          isActive: true,
          supplierId: s.id,
          updatedAt: now
        }
      });
      supplierUsers.push(user);
    } else {
      supplierUsers.push(existingUser);
    }
  }
  console.log(`  ✅ Supplier Users: ${supplierUsers.length} items`);

  // ─── 15 Contracts (1 per supplier) ─────────────────────
  const customers = await prisma.customer.findMany();
  const products = await prisma.product.findMany();

  if (customers.length === 0 || products.length === 0) {
    console.log("⚠️  Customers or Products not found. Run main seed first.");
    return;
  }

  for (let i = 0; i < createdSuppliers.length; i++) {
    const s = createdSuppliers[i];
    const customer = customers[i % customers.length];
    const selectedProducts = products.slice(i % products.length, (i % products.length) + 3);

    const contractNumber = `KTR-DK${String(i + 1).padStart(2, "0")}-${now.getFullYear()}`;

    const existingContract = await prisma.contract.findFirst({
      where: { noKontrak: contractNumber }
    });

    if (!existingContract) {
      const totalNilai = selectedProducts.reduce((sum, p) => {
        const qty = Math.floor(Math.random() * 50) + 10;
        return sum + Number(p.hargaJual) * qty;
      }, 0);

      const dpPersen = 30;
      const dp = totalNilai * (dpPersen / 100);

      await prisma.contract.create({
        data: {
          id: crypto.randomUUID(),
          noKontrak: contractNumber,
          customerId: customer.id,
          supplierId: s.id,
          alamatKirim: s.alamat ?? "Jl. Default No. 1",
          jadwalKirim: new Date(now.getTime() + (7 + i * 3) * 24 * 60 * 60 * 1000),
          tempoPembayaran: 30,
          dp: dp,
          dpPersen: dpPersen,
          totalNilai: totalNilai,
          catatanAdmin: `Kontrak afiliasi dengan ${s.nama} - ${s.spesialisasi}`,
          status: i < 5 ? StatusKontrak.APPROVED : (i < 10 ? StatusKontrak.REVIEW : StatusKontrak.DRAFT),
          createdById: supplierUsers[i].id,
          updatedAt: now,
          items: {
            create: selectedProducts.map((p) => {
              const qty = Math.floor(Math.random() * 50) + 10;
              return {
                id: crypto.randomUUID(),
                productId: p.id,
                spesifikasi: `${p.nama} untuk proyek ${s.nama}`,
                jumlah: qty,
                satuan: p.satuan,
                hargaSatuan: p.hargaJual,
                subtotal: Number(p.hargaJual) * qty
              };
            })
          }
        }
      });
    }
  }
  console.log(`  ✅ Contracts: 15 items (DK01-DK15)`);

  console.log("\n🎉 Supplier seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
