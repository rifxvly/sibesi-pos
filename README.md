# SiBesi POS

Scaffold aplikasi web POS untuk Toko Besi Persahabatan 2 berdasarkan `docs/prd.md`, `docs/erd.md`, `docs/implementation.md`, dan `docs/trd.md`.

## Stack

- Next.js 14 App Router
- React 18 + TypeScript
- Tailwind CSS
- Prisma + MySQL
- NextAuth v5 + Credentials + MFA helper
- Pakasir payment integration
- pdf-lib untuk nota dan kontrak

## Fitur yang Sudah Discaffold

- Login dan halaman MFA admin
- Dashboard utama dengan statistik, grafik, dan alert stok
- Halaman POS 3 kolom
- Manajemen produk, stok, pelanggan, kontrak, laporan, pengaturan
- API routes untuk produk, transaksi, kontrak, stok, laporan, Pakasir, dan MFA
- Prisma schema lengkap sesuai ERD
- Utilitas server untuk auth, crypto AES-256-GCM, TOTP, PDF, dan Pakasir
- Mode pembayaran dummy untuk QRIS dan virtual account demo lokal

## Setup

1. Salin `.env.example` menjadi `.env.local`
2. Isi `DATABASE_URL`, `NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, dan kredensial Pakasir/SMTP
3. Pastikan MySQL lokal aktif di `127.0.0.1:3306`
4. Jalankan:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Demo Seed

- Admin: `admin / Admin123!`
- Kasir: `kasir1 / Kasir123!`

## Catatan

- Build production sudah lolos (`npm run build`)
- `prisma:seed` tetap membutuhkan `DATABASE_URL` yang valid
- Default local database saat ini: `mysql://root@127.0.0.1:3306/sibesi_pos`
- Integrasi Pakasir dan SMTP akan aktif penuh setelah environment diisi
