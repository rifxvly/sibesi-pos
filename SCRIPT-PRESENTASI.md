# Script Presentasi - SiBesi POS
## Sistem Informasi Point of Sale untuk Toko Besi Persahabatan 2

---

## SLIDE 1: PEMBUKAAN

**Yang harus ditampilkan:** Judul proyek, logo, nama presenter

**Script:**
"Selamat pagi/siang semuanya. Perkenalkan, saya [nama Anda]. Hari ini saya akan mempresentasikan SiBesi POS, yaitu Sistem Informasi Point of Sale yang kami bangun khusus untuk Toko Besi Persahabatan 2. Sistem ini dirancang untuk menggantikan cara manual dalam mengelola penjualan, stok, dan kontrak proyek di toko besi."

---

## SLIDE 2: LATAR BELAKANG MASALAH

**Yang harus ditampilkan:** Poin-poin masalah yang dihadapi toko besi

**Script:**
"Sebelum kami membangun sistem ini, ada beberapa masalah yang umum terjadi di toko besi:
- Pencatatan penjualan masih manual, rawan kesalahan dan kehilangan data
- Stok barang sulit dipantau secara real-time, sering terjadi kehabisan stok tanpa peringatan
- Kontrak proyek dengan pelanggan besar masih dikelola secara terpisah
- Tidak ada laporan penjualan yang terstruktur untuk pengambilan keputusan
- Keamanan data transaksi belum terjamin

SiBesi POS hadir untuk menyelesaikan semua masalah ini dalam satu platform terpadu."

---

## SLIDE 3: TEKNOLOGI YANG DIGUNAKAN

**Yang harus ditampilkan:** Logo/framework stack teknologi

**Script:**
"Sistem ini dibangun menggunakan teknologi modern:
- **Next.js 14** dengan App Router untuk performa dan SEO yang optimal
- **React 18 + TypeScript** untuk antarmuka yang responsif dan type-safe
- **Tailwind CSS** untuk desain yang konsisten dan modern
- **Prisma ORM** dengan database **MySQL** untuk manajemen data yang efisien
- **NextAuth v5** untuk sistem autentikasi yang aman
- **PDF-Lib** untuk generate kontrak dan nota secara otomatis
- **Recharts** untuk visualisasi data dan grafik
- **WijayaPay** sebagai payment gateway untuk pembayaran non-tunai"

---

## SLIDE 4: ARSITEKTUR SISTEM

**Yang harus ditampilkan:** Diagram arsitektur sederhana

**Script:**
"Secara arsitektur, SiBesi POS menggunakan pola tiga lapis:
1. **Frontend** — Halaman web yang diakses melalui browser, dibangun dengan Next.js
2. **Backend API** — RESTful API yang terintegrasi langsung dengan Next.js App Router
3. **Database** — MySQL yang diakses melalui Prisma ORM

Sistem ini juga mendukung deployment dengan Docker untuk database, sehingga mudah disetup di lingkungan manapun."

---

## SLIDE 5: FITUR UTAMA — LOGIN & KEAMANAN

**Yang harus ditampilkan:** Screenshot halaman login

**Script:**
"Mari kita mulai dari halaman login. Sistem ini memiliki dua level akses:

1. **Admin** — Memiliki akses penuh ke semua fitur termasuk dashboard, manajemen produk, stok, pelanggan, kontrak, dan laporan. Admin juga dilengkapi dengan **MFA (Multi-Factor Authentication)** menggunakan TOTP/Google Authenticator untuk keamanan ekstra.

2. **Kasir** — Hanya memiliki akses ke halaman POS untuk transaksi, melihat stok, dan data pelanggan. Kasir tidak bisa mengakses dashboard admin, laporan keuangan, atau pengaturan sistem.

Setelah login, sistem akan otomatis mengarahkan pengguna ke halaman yang sesuai dengan role mereka. Session akan otomatis habis dalam 15 menit untuk keamanan."

---

## SLIDE 6: FITUR — DASHBOARD ADMIN

**Yang harus ditampilkan:** Screenshot dashboard

**Script:**
"Dashboard admin adalah pusat kendali sistem. Di sini admin bisa melihat:

- **4 Kartu Statistik** — Total penjualan hari ini, jumlah transaksi, produk dengan stok rendah, dan total pelanggan
- **Grafik Penjualan 7 Hari Terakhir** — Line chart yang menunjukkan tren penjualan harian
- **Grafik Penjualan per Kategori** — Bar chart yang menunjukkan kategori produk terlaris
- **Tabel Transaksi Terbaru** — 5 transaksi terakhir beserta status pembayarannya
- **Peringatan Stok Rendah** — Produk-produk yang stoknya sudah di bawah minimum
- **Aksi Cepat** — Tombol shortcut untuk transaksi baru, tambah produk, dan lihat laporan

Semua data ini real-time dari database, sehingga admin bisa mengambil keputusan dengan cepat dan akurat."

---

## SLIDE 7: FITUR — HALAMAN POS (POINT OF SALE)

**Yang harus ditampilkan:** Screenshot halaman POS

**Script:**
"Halaman POS adalah fitur utama yang digunakan kasir setiap hari. Desainnya terbagi menjadi 3 kolom:

**Kolom Kiri — Pencarian & Produk:**
- Search bar untuk mencari produk berdasarkan nama atau kode barang
- Filter kategori: Besi, Semen, Pasir, Cat, Paku, Alat, dan Lainnya
- Grid produk dengan gambar, harga, dan stok tersedia
- Pagination untuk navigasi produk yang banyak

**Kolom Tengah — Keranjang Belanja:**
- Daftar produk yang dipilih pelanggan
- Tombol tambah/kurang jumlah barang
- Input diskon jika ada
- Total harga yang otomatis terhitung

**Kolom Kanan — Pembayaran:**
- Tombol checkout yang membuka modal pembayaran
- Pilihan metode bayar: Tunai, Transfer, QRIS, Virtual Account, dan Kredit
- Untuk tunai: input uang diterima dan hitung kembalian otomatis
- Untuk QRIS/VA: integrasi dengan payment gateway WijayaPay

Setelah transaksi selesai, stok otomatis berkurang dan data tercatat di database."

---

## SLIDE 8: FITUR — MANAJEMEN PRODUK

**Yang harus ditampilkan:** Screenshot halaman produk

**Script:**
"Di halaman manajemen produk, admin bisa:
- Menambah produk baru dengan kode barang, nama, kategori, satuan, harga jual, harga pokok, dan stok minimum
- Mengedit data produk yang sudah ada
- Menghapus atau menonaktifkan produk
- Upload gambar produk

Kategori produk sudah disesuaikan dengan kebutuhan toko besi: Besi, Semen, Pasir, Cat, Paku, Alat, dan Lainnya. Setiap produk juga memiliki stok minimum yang akan memicu peringatan di dashboard."

---

## SLIDE 9: FITUR — MANAJEMEN STOK

**Yang harus ditampilkan:** Screenshot halaman stok

**Script:**
"Manajemen stok memungkinkan admin untuk:
- Melihat seluruh stok produk dalam satu tabel
- Melakukan penyesuaian stok dengan 3 tipe: IN (masuk), OUT (keluar), dan ADJUSTMENT (penyesuaian)
- Setiap perubahan stok tercatat di tabel StockMovement dengan keterangan dan user yang melakukan
- Produk dengan stok rendah akan ditandai dengan peringatan visual

Semua riwayat pergerakan stok bisa dilacak, sehingga tidak ada perubahan yang tidak terdokumentasi."

---

## SLIDE 10: FITUR — MANAJEMEN PELANGGAN

**Yang harus ditampilkan:** Screenshot halaman pelanggan

**Script:**
"Sistem ini juga mengelola data pelanggan dengan fitur:
- Tambah pelanggan baru dengan tipe Perorangan atau Perusahaan
- Data perusahaan mencakup nama perusahaan, NPWP, alamat, telepon, dan email
- **Keamanan data sensitif** — NPWP dan alamat pelanggan dienkripsi menggunakan AES-256-GCM sebelum disimpan ke database
- Edit dan kelola data pelanggan yang sudah ada

Data pelanggan ini kemudian bisa dipilih saat melakukan transaksi atau membuat kontrak proyek."

---

## SLIDE 11: FITUR — MANAJEMEN KONTRAK

**Yang harus ditampilkan:** Screenshot halaman kontrak

**Script:**
"Untuk proyek besar, toko besi sering bekerja dengan sistem kontrak. Fitur kontrak memungkinkan:
- Membuat kontrak baru dengan memilih pelanggan dan item material
- Menentukan alamat kirim, jadwal pengiriman, tempo pembayaran, dan uang muka (DP)
- Status kontrak mengikuti alur: DRAFT → REVIEW → APPROVED/REJECTED
- Preview kontrak sebelum disimpan
- **Generate PDF otomatis** — Sistem membuat file PDF kontrak lengkap dengan hash SHA-256 untuk verifikasi keaslian
- Kontrak yang disetujui bisa dikaitkan dengan transaksi

Ini sangat berguna untuk proyek konstruksi yang membutuhkan dokumentasi formal."

---

## SLIDE 12: FITUR — LAPORAN

**Yang harus ditampilkan:** Screenshot halaman laporan

**Script:**
"Halaman laporan menyediakan 6 jenis laporan:

1. **Laporan Penjualan** — Total penjualan, grafik harian, top 5 produk terlaris, dan tabel penjualan per hari
2. **Laporan Stok** — Stok per kategori, produk stok rendah, dan status ketersediaan
3. **Laporan Kontrak** — Distribusi status kontrak, total nilai kontrak, dan tabel kontrak terbaru
4. **Laporan Metode Pembayaran** — Distribusi metode bayar (Cash, QRIS, Transfer, VA) dengan donut chart
5. **Laporan Pentest** — Hasil penetration testing dengan OWASP Top 10 compliance
6. **Laporan Bug Bounty** — Log keamanan dan fitur keamanan yang diimplementasi

Setiap laporan bisa difilter berdasarkan periode: hari ini, minggu ini, bulan ini, atau tahun ini. Data juga bisa diekspor untuk keperluan presentasi atau audit."

---

## SLIDE 13: FITUR — PENGATURAN

**Yang harus ditampilkan:** Screenshot halaman settings

**Script:**
"Di halaman pengaturan, admin bisa:
- Mengelola profil pengguna (nama, email, no HP, password)
- Setup MFA dengan scan QR code menggunakan Google Authenticator
- Mengatur informasi toko (nama, alamat, telepon, email)
- Melihat aktivitas login terbaru dengan IP address dan status
- Melakukan backup data
- Zona berbahaya untuk reset data demo (hanya untuk development)

Sistem juga menampilkan informasi versi aplikasi, status database, last backup, dan environment."

---

## SLIDE 14: ALUR TRANSAKSI

**Yang harus ditampilkan:** Flowchart alur transaksi

**Script:**
"Berikut adalah alur transaksi dari awal sampai selesai:

1. **Kasir membuka halaman POS** — Sistem memuat semua produk dan stok terbaru
2. **Kasir mencari dan memilih produk** — Bisa filter kategori atau search langsung
3. **Produk ditambahkan ke keranjang** — Stok dicek, jika habis tidak bisa ditambahkan
4. **Kasir mengatur jumlah dan diskon** — Total harga terhitung otomatis
5. **Kasir klik Checkout** — Modal pembayaran terbuka
6. **Pilih metode pembayaran:**
   - **Tunai** → Input uang diterima → Sistem hitung kembalian → Stok langsung berkurang → Transaksi PAID
   - **Transfer** → Transaksi langsung PAID → Stok berkurang
   - **QRIS/VA** → Sistem generate payment link via WijayaPay → Transaksi PENDING → Stok berkurang setelah konfirmasi
   - **Kredit** → Transaksi PENDING → Stok berkurang
7. **Transaksi selesai** → Data tersimpan → Kasir bisa cetak nota"

---

## SLIDE 15: ALUR KONTRAK

**Yang harus ditampilkan:** Flowchart alur kontrak

**Script:**
"Alur pembuatan kontrak proyek:

1. **Admin membuka halaman kontrak baru**
2. **Pilih pelanggan** — Bisa pelanggan existing atau baru
3. **Tambahkan item material** — Pilih produk, tentukan jumlah, harga satuan, dan spesifikasi
4. **Isi detail kontrak** — Alamat kirim, jadwal pengiriman, tempo pembayaran, DP
5. **Preview kontrak** — Review semua detail sebelum menyimpan
6. **Submit** → Status kontrak menjadi REVIEW → PDF otomatis di-generate dengan hash SHA-256
7. **Approve/Reject** — Admin meninjau dan mengubah status menjadi APPROVED atau REJECTED
8. **Kontrak APPROVED** → Bisa dikaitkan dengan transaksi → Material dikirim sesuai jadwal"

---

## SLIDE 16: KEAMANAN SISTEM

**Yang harus ditampilkan:** Poin-poin keamanan

**Script:**
"Keamanan adalah prioritas utama dalam sistem ini:

- **Autentikasi JWT** melalui NextAuth dengan session timeout 15 menit
- **Password hashing** menggunakan bcrypt dengan salt round 12
- **MFA/TOTP** untuk admin menggunakan Google Authenticator
- **RBAC Middleware** — Role-based access control di level routing dan API
- **Enkripsi AES-256-GCM** untuk data sensitif pelanggan (NPWP, alamat)
- **Zod validation** di semua input API untuk mencegah injection
- **Prisma ORM** dengan parameterized queries — aman dari SQL injection
- **Audit Log** — Semua aksi penting tercatat dengan user, IP, dan timestamp
- **SHA-256 hash** pada PDF kontrak untuk verifikasi keaslian dokumen
- **Secure cookie configuration** dengan SameSite attribute"

---

## SLIDE 17: DATABASE SCHEMA

**Yang harus ditampilkan:** ERD diagram

**Script:**
"Database MySQL memiliki 9 tabel utama:

1. **User** — Data pengguna (admin dan kasir) dengan role, MFA secret, dan status aktif
2. **Product** — Master data produk dengan kategori, harga, dan stok
3. **Customer** — Data pelanggan dengan enkripsi pada field sensitif
4. **Transaction** — Header transaksi dengan nomor unik, total, metode bayar, dan status
5. **TransactionDetail** — Detail item per transaksi (relasi ke Product)
6. **Contract** — Header kontrak proyek dengan status, DP, dan jadwal kirim
7. **ContractItem** — Detail item per kontrak (relasi ke Product)
8. **StockMovement** — Riwayat semua pergerakan stok (IN, OUT, ADJUSTMENT)
9. **AuditLog** — Log aktivitas sistem untuk keamanan dan audit

Semua tabel terhubung dengan relasi yang proper dan menggunakan index untuk performa query."

---

## SLIDE 18: DEMO DATA

**Yang harus ditampilkan:** Tabel demo data

**Script:**
"Sistem ini sudah dilengkapi dengan demo data yang realistis:

- **2 User:** Admin (admin/Admin123!) dan Kasir (kasir1/Kasir123!)
- **10 Produk:** Besi Beton, Hollow Galvanis, Semen Tiga Roda, Pasir Cor, Batu Split, Cat Tembok, Paku Beton, Gerinda Tangan, dan Talang PVC
- **6 Pelanggan:** 4 perusahaan (PT Bina Maju, CV Karya Pilar, PT Mandiri Konstruksi, Bengkel Baja Sejahtera) dan 2 perorangan (Rudi Hartono, Siti Aisyah)
- **8 Transaksi:** Berbagai metode pembayaran dan status
- **3 Kontrak:** 1 Approved, 1 Review, 1 Rejected

Data ini bisa di-generate ulang kapan saja dengan perintah `npm run prisma:seed`."

---

## SLIDE 19: CARA MENJALANKAN

**Yang harus ditampilkan:** Command terminal

**Script:**
"Untuk menjalankan sistem ini, ikuti langkah berikut:

1. **Clone repository** dan masuk ke direktori proyek
2. **Copy .env.example ke .env.local** dan isi variabel lingkungan:
   - DATABASE_URL untuk koneksi MySQL
   - NEXTAUTH_SECRET untuk enkripsi session
   - ENCRYPTION_KEY untuk enkripsi data pelanggan
   - Kredensial WijayaPay dan SMTP (opsional)
3. **Pastikan MySQL berjalan** di 127.0.0.1:3306 — bisa pakai Docker dengan `docker-compose up -d`
4. **Install dependencies:** `npm install`
5. **Generate Prisma client:** `npm run prisma:generate`
6. **Jalankan migrasi:** `npm run prisma:migrate`
7. **Isi demo data:** `npm run prisma:seed`
8. **Start development server:** `npm run dev`
9. **Buka browser** di http://localhost:3000

Untuk production, jalankan `npm run build` lalu `npm run start`."

---

## SLIDE 20: PENUTUP

**Yang harus ditampilkan:** Kesimpulan dan terima kasih

**Script:**
"Sebagai kesimpulan, SiBesi POS adalah sistem yang:

- **Modern** — Dibangun dengan teknologi terkini dan UI yang intuitif
- **Aman** — Multi-layer security dari autentikasi hingga enkripsi data
- **Lengkap** — Mencakup semua aspek operasional toko besi: POS, stok, pelanggan, kontrak, dan laporan
- **Scalable** — Arsitektur yang siap dikembangkan untuk fitur tambahan
- **Teruji** — Sudah melewati penetration testing dengan skor keamanan 92/100

Sistem ini siap digunakan untuk meningkatkan efisiensi operasional Toko Besi Persahabatan 2 dan memberikan pengalaman yang lebih baik bagi admin maupun kasir.

Terima kasih atas perhatiannya. Saya terbuka untuk pertanyaan dan diskusi."

---

## Q&A — ANTISIPASI PERTANYAAN

**Q: Bagaimana jika internet mati saat transaksi?**
A: Sistem ini berbasis web dan membutuhkan koneksi ke server. Untuk skenario offline, bisa ditambahkan fitur local storage yang mensinkronisasi data saat koneksi kembali.

**Q: Apakah bisa digunakan untuk toko lain selain toko besi?**
A: Ya, sistem ini cukup generik. Kategori produk, satuan, dan alur bisnis bisa disesuaikan untuk jenis toko material lainnya.

**Q: Bagaimana backup data?**
A: Database MySQL bisa di-backup secara berkala menggunakan mysqldump atau tools backup otomatis. Sistem juga menyediakan tombol backup manual di halaman pengaturan.

**Q: Apakah payment gateway WijayaPay wajib?**
A: Tidak. Sistem memiliki mode dummy payment yang bisa digunakan untuk simulasi QRIS dan Virtual Account tanpa koneksi ke gateway sungguhan. Tinggal set `PAYMENT_GATEWAY_MODE=dummy` di environment.

**Q: Berapa biaya operasional server?**
A: Untuk skala toko besi kecil-menengah, bisa menggunakan VPS dengan spesifikasi minimal 2GB RAM dan 20GB storage. Estimasi biaya sekitar Rp 100-200 ribu per bulan tergantung provider.
