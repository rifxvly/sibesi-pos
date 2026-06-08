import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TableRow,
  TableCell,
  Table,
  WidthType,
  BorderStyle,
  PageBreak,
  Footer,
  Header,
  Tab,
  NumberFormat,
  LevelFormat
} from "docx";
import { writeFileSync } from "fs";

const BOLD = (text: string) => new TextRun({ text, bold: true });
const NORMAL = (text: string) => new TextRun({ text });
const BOLDI = (text: string) => new TextRun({ text, bold: true, italics: true });
const H1 = (text: string) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [BOLD(text)] });
const H2 = (text: string) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, children: [BOLD(text)] });
const H3 = (text: string) => new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [BOLD(text)] });
const P = (...runs: TextRun[]) => new Paragraph({ spacing: { after: 120 }, children: runs });
const PB = (text: string) => P(BOLD(text));
const PN = (text: string) => P(NORMAL(text));
const PL = (items: string[]) => items.map(i => new Paragraph({ spacing: { after: 80 }, children: [NORMAL("• " + i)], indent: { left: 720 } }));
const PM = (text: string) => new Paragraph({ spacing: { after: 60 }, children: [NORMAL(text)] });

function makeTable(headers: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map(h => new TableCell({
          children: [new Paragraph({ children: [BOLD(h)] })],
          shading: { fill: "2C3E50", color: "auto" },
          width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE }
        })),
        tableHeader: true
      }),
      ...rows.map(row => new TableRow({
        children: row.map(cell => new TableCell({
          children: [new Paragraph({ children: [NORMAL(cell)] })],
          width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE }
        }))
      }))
    ]
  });
}

function blankLine() { return new Paragraph({ spacing: { after: 200 }, children: [] }); }

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 24 } }
    }
  },
  sections: [
    // ═══════════════════════════════════════════════
    // COVER PAGE
    // ═══════════════════════════════════════════════
    {
      children: [
        blankLine(), blankLine(), blankLine(), blankLine(), blankLine(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "LAPORAN KEAMANAN SISTEM", bold: true, size: 36, font: "Calibri" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "POS (Point of Sale)", bold: true, size: 32, font: "Calibri" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "SiBesi POS", bold: true, size: 28, font: "Calibri", color: "2C3E50" })] }),
        blankLine(), blankLine(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [NORMAL("Toko Besi Persahabatan 2")] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [NORMAL("https://sibesi-pos.vercel.app")] }),
        blankLine(), blankLine(), blankLine(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [BOLD("Disusun oleh:")] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [NORMAL("Kelompok EAS Transaksi Elektronik")] }),
        blankLine(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [NORMAL("Tahun Ajaran 2025/2026")] }),
        blankLine(), blankLine(), blankLine(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [BOLD("EAS TRANSAKSI ELEKTRONIK")] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [NORMAL("Genap 2026")] }),
      ]
    },

    // ═══════════════════════════════════════════════
    // BAB I - PENDAHULUAN
    // ═══════════════════════════════════════════════
    {
      children: [
        H1("BAB I: PENDAHULUAN"),
        H2("1.1 Latar Belakang"),
        PN("SiBesi POS adalah sistem Point of Sale berbasis web yang dikembangkan untuk Toko Besi Persahabatan 2. Sistem ini menangani transaksi penjualan, manajemen produk, kontrak dengan supplier/distributor, serta integrasi payment gateway. Dengan deployment di Vercel dan database di Railway (MySQL), keamanan sistem menjadi aspek kritis yang perlu diuji secara menyeluruh."),
        PN("Laporan ini mencakup tiga bagian utama: (1) implementasi data kontrak dengan strategi isolasi data 3 lapis, (2) pengujian penetrasi (pentest) terhadap 9 kategori keamanan, dan (3) perencanaan program Bug Bounty."),

        H2("1.2 Lingkungan Pengujian"),
        makeTable(["Komponen", "Detail"], [
          ["URL Aplikasi", "https://sibesi-pos.vercel.app"],
          ["Database", "Railway MySQL 8.0 (remote)"],
          ["Framework", "Next.js 14.2.4 (App Router)"],
          ["ORM", "Prisma 5.15+"],
          ["Auth", "NextAuth v5 (JWT + Credentials)"],
          ["Payment Gateway", "Pakasir / WijayaPay / Dummy"],
          ["OS Tester", "Windows 11"],
          ["Browser", "Chrome 125+, Firefox 126+"],
          ["Tools", "Burp Suite Community, OWASP ZAP, Postman, curl, Browser DevTools"],
        ]),
        blankLine(),

        H2("1.3 Akun Pengujian"),
        makeTable(["Role", "Username", "Password", "Akses"], [
          ["Admin", "admin", "Admin123!", "Full access - Dashboard, Produk, Stok, Kontrak, Laporan, Pengaturan"],
          ["Kasir", "kasir1", "Kasir123!", "POS, Stok, Pelanggan"],
          ["Supplier 01-15", "supplier01-supplier15", "Supplier123!", "Kontrak milik supplier terkait"],
        ]),
        blankLine(),

        H2("1.4 Tech Stack & Attack Surface"),
        PN("SiBesi POS menggunakan arsitektur modern berikut:"),
        ...PL([
          "Frontend: React 18 + TypeScript + Tailwind CSS",
          "Backend: Next.js 14 App Router (Server Components + API Routes)",
          "Database: MySQL 8.0 via Prisma ORM",
          "Auth: NextAuth v5 (JWT Strategy, Credentials Provider)",
          "Session: 15 menit expiry (JWT-based)",
          "MFA: TOTP via otplib (opsional untuk Admin)",
          "Payment: Pakasir/WijayaPay + Dummy mode",
          "PDF: pdf-lib untuk kontrak & nota",
          "Deployment: Vercel (serverless) + Railway (MySQL)",
        ]),
        PN("Attack surface utama meliputi: API routes, session management, authorization middleware, payment gateway integration, file generation (PDF), dan client-side rendering."),
      ]
    },

    // ═══════════════════════════════════════════════
    // BAB II - DATA KONTRAK & ISOLASI DATA
    // ═══════════════════════════════════════════════
    {
      children: [
        new Paragraph({ children: [new PageBreak()] }),
        H1("BAB II: DATA KONTRAK & STRATEGI ISOLASI DATA"),
        H2("2.1 Data Kontrak 15 Supplier (DK01-DK15)"),
        PN("Berikut adalah 15 data kontrak yang terafiliasi dengan 15 supplier/distributor:"),
        blankLine(),
        makeTable(["No", "Kode", "Nama Supplier", "Spesialisasi", "Nama File Kontrak"], [
          ["1", "DK01", "PT Besi Jaya Abadi", "Besi & Baja", "SiBesi.DK01-BesiJayaAbadi"],
          ["2", "DK02", "CV Semen Murah Jaya", "Semen", "SiBesi.DK02-SemenMurahJaya"],
          ["3", "DK03", "PT Pasir Indah Perkasa", "Pasir & Agregat", "SiBesi.DK03-PasirIndahPerkasa"],
          ["4", "DK04", "Toko Cat Dewi", "Cat & Finishing", "SiBesi.DK04-TokoCatDewi"],
          ["5", "DK05", "CV Paku Indonesia", "Paku & Fastener", "SiBesi.DK05-CVPakuIndonesia"],
          ["6", "DK06", "PT Alat Teknik Mandiri", "Alat Teknik", "SiBesi.DK06-AlatTeknikMandiri"],
          ["7", "DK07", "Dist. Material Bangunan Jaya", "Multi Material", "SiBesi.DK07-MaterialBangunanJaya"],
          ["8", "DK08", "PT Baja Konstruksi Indonesia", "Baja Konstruksi", "SiBesi.DK08-BajaKonstruksiIndo"],
          ["9", "DK09", "CV Sumber Bangunan", "Material Umum", "SiBesi.DK09-SumberBangunan"],
          ["10", "DK10", "PT Logam Mulia Persada", "Logam & Besi", "SiBesi.DK10-LogamMuliaPersada"],
          ["11", "DK11", "Toko Bangunan Harapan", "Bangunan Umum", "SiBesi.DK11-TokoBangunanHarapan"],
          ["12", "DK12", "CV Mitra Konstruksi Sejahtera", "Konstruksi", "SiBesi.DK12-MitraKonstruksi"],
          ["13", "DK13", "PT Sumber Daya Material", "Material Premium", "SiBesi.DK13-SumberDayaMaterial"],
          ["14", "DK14", "Distributor Besi Nusantara", "Besi Nusantara", "SiBesi.DK14-DistBesiNusantara"],
          ["15", "DK15", "CV Berkah Bangunan", "Bahan Bangunan", "SiBesi.DK15-BerkahBangunan"],
        ]),
        blankLine(),

        H2("2.2 Strategi Penyimpanan Data"),
        PN("Penyimpanan data kontrak dilakukan dengan pendekatan centralized database dengan relasi antar tabel:"),
        ...PL([
          "Tabel 'supplier' menyimpan data master 15 supplier (kode DK01-DK15)",
          "Tabel 'contract' menyimpan data kontrak dengan foreign key ke supplier dan customer",
          "Tabel 'contractitem' menyimpan detail item kontrak (produk, jumlah, harga)",
          "File PDF kontrak disimpan di '/public/uploads/contracts/' dengan nama [noKontrak].pdf",
          "Hash SHA-256 disimpan di kolom 'hashValue' untuk integritas dokumen",
          "Semua data menggunakan Prisma ORM dengan parameterized queries (SQL injection resistant)",
        ]),
        blankLine(),

        H2("2.3 Strategi Pengambilan Data (Retrieval)"),
        PN("Pengambilan data kontrak menggunakan mekanisme berikut:"),
        ...PL([
          "API GET /api/contracts: Mengembalikan semua kontrak (hanya Admin)",
          "API GET /api/contracts/[id]: Mengembalikan detail kontrak spesifik",
          "Query parameter tidak diterima langsung — menggunakan params.id dari URL path",
          "Include relasi customer, items, dan product untuk data lengkap",
          "Order by createdAt DESC (data terbaru di atas)",
        ]),
        blankLine(),

        H2("2.4 Strategi Pendistribusian Data (Access Control)"),
        PN("Pendistribusian data menggunakan 3 lapis keamanan (defense in depth):"),
        blankLine(),

        H3("Lapis 1: Middleware Authentication"),
        PN("Middleware Next.js memvalidasi JWT session di setiap request:"),
        ...PL([
          "Route /login dan /mfa bersifat public",
          "Route /dashboard, /products, /stock, /contracts, /customers, /reports, /settings memerlukan autentikasi",
          "Route /api/auth dan /api/pakasir/webhook bersifat public API",
          "Semua route lain di /api/* memerlukan session valid",
          "Redirect ke /login jika tidak terautentikasi",
        ]),
        blankLine(),

        H3("Lapis 2: Role-Based Access Control (RBAC)"),
        PN("Setiap role memiliki hak akses berbeda:"),
        makeTable(["Role", "Halaman yang Diakses", "API yang Diakses"], [
          ["ADMIN", "Dashboard, Produk, Stok, Kontrak, Pelanggan, Laporan, Pengaturan", "Semua API"],
          ["KASIR", "POS, Stok, Pelanggan", "/api/products, /api/transactions, /api/stock, /api/customers"],
          ["SUPPLIER", "Kontrak (hanya kontrak sendiri)", "/api/contracts (filter by supplierId)"],
        ]),
        blankLine(),
        PN("Kasir yang mengakses /dashboard akan di-redirect ke /pos. Supplier yang mengakses /dashboard akan di-redirect ke /contracts."),
        blankLine(),

        H3("Lapis 3: API-Level Authorization"),
        PN("Setiap API route memiliki guard otorisasi:"),
        ...PL([
          "ensureAdminApi(): Memverifikasi session + role === 'ADMIN'. Return 401 jika tidak login, 403 jika bukan admin",
          "ensureAuthenticatedApi(): Memverifikasi session aktif. Return 401 jika tidak login",
          "Contracts API (GET/POST): Hanya Admin yang bisa mengakses semua kontrak",
          "Contract Approve API (PATCH): Hanya Admin yang bisa approve/reject kontrak",
          "Transaction API: Menggunakan getActorUserId() untuk tracking user yang melakukan transaksi",
          "Supplier hanya bisa melihat kontrak yang terafiliasi (filter di UI level)",
        ]),
        blankLine(),

        H2("2.5 Diagram Alur Keamanan"),
        PN("Request dari client → Middleware (JWT validation) → API Route → Auth Guard (ensureAdminApi/ensureAuthenticatedApi) → Prisma Query (parameterized) → Response ke client."),
        PN("Dengan 3 lapis ini, supplier tidak bisa: (1) mengakses halaman selain /contracts tanpa login, (2) mengakses API kontrak lain tanpa role Admin, (3) memanipulasi query database karena Prisma menggunakan parameterized queries."),
      ]
    },

    // ═══════════════════════════════════════════════
    // BAB III - PENGUJIAN PENETRASI (PENTEST)
    // ═══════════════════════════════════════════════
    {
      children: [
        new Paragraph({ children: [new PageBreak()] }),
        H1("BAB III: PENGUJIAN PENETRASI (PENTEST)"),
        PN("Pengujian penetrasi dilakukan terhadap 9 kategori sesuai requirement. Setiap pengujian mencakup: Lingkungan tes, Tools yang dipakai, Proses pengujian, Temuan, dan Usulan perbaikan."),
        blankLine(),

        // ─── 3.1 ───
        H2("3.1 Pengujian Manipulasi Harga & Gateway Pembayaran"),
        H3("3.1.1 Lingkungan Tes"),
        PN("Target: API POST /api/transactions, Komponen PaymentModal di frontend, Payment Gateway (Dummy/WijayaPay mode)."),
        H3("3.1.2 Tools yang Dipakai"),
        PN("Burp Suite Community (intercept & modify HTTP requests), Browser DevTools (Network tab), Postman (API testing)."),
        H3("3.1.3 Proses Pengujian"),
        PN("a) Manipulasi harga satuan via API: Mengirim request POST /api/transactions dengan hargaSatuan yang dimodifikasi melalui Burp Suite intercept. Contoh: mengubah hargaSatuan dari 55000 menjadi 1 pada item transaksi."),
        PN("b) Manipulasi subtotal: Mengirim subtotal yang tidak sesuai dengan jumlah × hargaSatuan. Server menggunakan harga dari request, bukan dari database."),
        PN("c) Manipulasi diskon: Mengirim diskon negatif atau diskon melebihi total belanja untuk mendapatkan 'kembalian' negatif."),
        PN("d) Manipulasi uangDiterima: Pada metode TUNAI, mengirim uangDiterima yang sangat besar untuk mendapatkan kembalian besar."),
        PN("e) Manipulasi response payment gateway: Memodifikasi payload callback dari payment gateway (mode dummy)."),
        H3("3.1.4 Temuan"),
        makeTable(["ID", "Severity", "Temuan"], [
          ["VULN-001", "HIGH", "Server tidak memvalidasi hargaSatuan dari database — menerima harga dari client. Hacker bisa memanipulasi harga di request untuk membeli produk dengan harga sangat murah."],
          ["VULN-002", "MEDIUM", "Subtotal tidak divalidasi ulang oleh server. Client bisa mengirim subtotal yang tidak = jumlah × hargaSatuan."],
          ["VULN-003", "MEDIUM", "Diskon tidak memiliki batas maksimal relatif terhadap total belanja (hanya min(0))."],
          ["VULN-004", "LOW", "Mode dummy payment gateway tidak memvalidasi callback signature — mudah dimanipulasi."],
        ]),
        blankLine(),
        H3("3.1.5 Usulan Perbaikan"),
        ...PL([
          "KRITIS: Server harus menghitung harga dari database, bukan dari request client. Validasi: hargaSatuan harus == product.hargaJual",
          "Validasi subtotal: subtotal harus == jumlah × hargaSatuan (server-side)",
          "Batas diskon maksimal 30% dari total belanja",
          "Implementasikan HMAC signature untuk validasi callback payment gateway",
          "Logging semua manipulasi harga yang terdeteksi ke AuditLog",
        ]),
        blankLine(),

        // ─── 3.2 ───
        H2("3.2 Pengujian Kerentanan Logika Bisnis"),
        H3("3.2.1 Lingkungan Tes"),
        PN("Target: Alur transaksi POS, Alur kontrak, Stok management, Role switching."),
        H3("3.2.2 Tools yang Dipakai"),
        PN("Browser DevTools (localStorage, cookies), Postman, Burp Suite, curl."),
        H3("3.2.3 Proses Pengujian"),
        PN("a) Race condition pada stok: Mengirim beberapa transaksi secara bersamaan untuk produk dengan stok terbatas. Jika stok = 5 dan 3 transaksi masing-masing memesan 3, apakah semua berhasil?"),
        PN("b) Double spending: Membuat transaksi QRIS/VA, lalu sebelum pembayaran, membuat transaksi baru dengan jumlah yang sama."),
        PN("c) Bypass role check: Mengubah role di JWT token atau session untuk mengakses halaman admin."),
        PN("d) Kontrak tanpa approval: Membuat kontrak langsung dengan status APPROVED tanpa melalui alur REVIEW."),
        PN("e) Stok negatif: Membeli jumlah melebihi stok yang tersedia dengan metode TUNAI/TRANSFER."),
        H3("3.2.4 Temuan"),
        makeTable(["ID", "Severity", "Temuan"], [
          ["VULN-005", "HIGH", "Race condition pada stok: Tidak ada locking mechanism. 3 transaksi simultan untuk produk dengan stok 5 masing-masing memesan 3 → semua berhasil, stok menjadi -4."],
          ["VULN-006", "MEDIUM", "Role hanya dicek via JWT token di client-side (middleware). Server-side role check ada di API tertentu tapi tidak konsisten."],
          ["VULN-007", "MEDIUM", "Tidak ada validasi untuk mencegah kasir membuat transaksi untuk diri sendiri dengan metode KREDIT."],
          ["VULN-008", "LOW", "Transaksi PENDING (QRIS/VA) tidak memiliki auto-expire timeout. Transaksi bisa menggantung selamanya."],
        ]),
        blankLine(),
        H3("3.2.5 Usulan Perbaikan"),
        ...PL([
          "Implementasi SELECT FOR UPDATE atau database-level locking untuk stok validation",
          "Tambahkan idempotency key untuk mencegah double spending",
          "Validasi role di SETIAP API endpoint, bukan hanya di middleware",
          "Implementasi auto-expire untuk transaksi PENDING (>15 menit → CANCELLED)",
          "Audit logging untuk semua perubahan status kontrak",
        ]),
        blankLine(),

        // ─── 3.3 ───
        H2("3.3 Insecure Direct Object Reference (IDOR)"),
        H3("3.3.1 Lingkungan Tes"),
        PN("Target: API GET /api/contracts/[id], API GET /api/transactions/[id], Semua API dengan parameter ID di URL."),
        H3("3.3.2 Tools yang Dipakai"),
        PN("Postman, curl, Burp Suite (Repeater)."),
        H3("3.3.3 Proses Pengujian"),
        PN("a) IDOR pada kontrak: Login sebagai Supplier01, lalu akses /api/contracts/[id_supplier02] untuk melihat kontrak supplier lain."),
        PN("b) IDOR pada transaksi: Login sebagai Kasir, lalu akses /api/transactions/[id_transaksi_lain]."),
        PN("c) IDOR pada contract PDF: Mengakses /uploads/contracts/KTR-xxx.pdf tanpa autentikasi."),
        PN("d) IDOR pada product: Mengakses /api/products/[id] untuk melihat data produk termasuk harga pokok."),
        H3("3.3.4 Temuan"),
        makeTable(["ID", "Severity", "Temuan"], [
          ["VULN-009", "HIGH", "Contract API tidak memfilter berdasarkan supplierId. Supplier bisa melihat kontrak lain jika mengetahui ID-ниема."],
          ["VULN-010", "HIGH", "Contract PDF bisa diakses tanpa autentikasi melalui URL /uploads/contracts/[noKontrak].pdf"],
          ["VULN-011", "MEDIUM", "Transaction GET tidak memiliki filter role — semua user dengan akses API bisa melihat semua transaksi."],
          ["VULN-012", "MEDIUM", "Product API mengembalikan hargaPokok (harga beli) ke client — informasi sensitif untuk kasir."],
        ]),
        blankLine(),
        H3("3.3.5 Usulan Perbaikan"),
        ...PL([
          "Implementasi row-level filtering: Supplier hanya bisa akses kontrak WHERE supplierId = session.user.supplierId",
          "Protect file uploads: Serve PDF melalui API route dengan autentikasi, bukan langsung dari public folder",
          "Filter transaksi berdasarkan user role di server-side",
          "Sembunyikan hargaPokok dari response API untuk non-admin",
          "Gunakan UUID yang sulit ditebak sebagai ID di URL (sudah menggunakan CUID)",
        ]),
        blankLine(),

        // ─── 3.4 ───
        H2("3.4 SSRF & HTML Injection pada Generate Contract"),
        H3("3.4.1 Lingkungan Tes"),
        PN("Target: API PATCH /api/contracts/[id]/approve, Komponen PDF generation (pdf-lib), Kolom catatanAdmin dan alamatKirim."),
        H3("3.4.2 Tools yang Dipakai"),
        PN("Postman, curl, Burp Suite."),
        H3("3.4.3 Proses Pengujian"),
        PN("a) HTML Injection pada catatanAdmin: Mengirim catatanAdmin berisi HTML/JavaScript: <img src=x onerror=alert(1)>. Cek apakah render di browser."),
        PN("b) HTML Injection pada alamatKirim: Mengirim alamatKirim berisi script tags."),
        PN("c) SSRF pada nama file: Membuat nomor kontrak dengan path traversal: ../../../etc/passwd"),
        PN("d) XSS pada PDF content: Menyuntikkan JavaScript ke kolom spesifikasi yang ditampilkan di PDF."),
        PN("e) Path traversal pada file PDF: Menggunakan noKontrak seperti ../../public/uploads/malicious.pdf."),
        H3("3.4.4 Temuan"),
        makeTable(["ID", "Severity", "Temuan"], [
          ["VULN-013", "MEDIUM", "Kolom catatanAdmin dan alamatKirim tidak melakukan sanitasi input. Meskipun React melakukan auto-escaping, stored XSS mungkin terjadi di PDF output."],
          ["VULN-014", "MEDIUM", "No kontrak digunakan sebagai nama file PDF tanpa sanitasi path traversal. noKontrak dengan karakter ../ bisa menulis file ke lokasi yang tidak diinginkan."],
          ["VULN-015", "LOW", "Tidak ada Content-Security-Policy header untuk mencegah XSS injection."],
          ["VULN-016", "LOW", "pdf-lib tidak melakukan sanitasi input text — teks dengan Unicode spoofing bisa muncul di PDF."],
        ]),
        blankLine(),
        H3("3.4.5 Usulan Perbaikan"),
        ...PL([
          "Sanitasi input: Bersihkan semua karakter HTML dari kolom text (catatanAdmin, alamatKirim, spesifikasi)",
          "Validasi noKontrak: Hanya izinkan karakter alfanumerik dan strip untuk nama file",
          "Implementasi Content-Security-Policy header",
          "Gunakan UUID untuk nama file PDF, bukan nomor kontrak yang bisa dimanipulasi",
          "Sanitasi output PDF: Strip semua tag HTML dari text yang ditulis ke PDF",
        ]),
        blankLine(),

        // ─── 3.5 ───
        H2("3.5 Pengujian Keamanan API"),
        H3("3.5.1 Lingkungan Tes"),
        PN("Target: Semua API routes, HTTP methods, Content-Type, CORS policy."),
        H3("3.5.2 Tools yang Dipakai"),
        PN("Postman, curl, OWASP ZAP (Active Scan), Burp Suite (Spider + Intruder)."),
        H3("3.5.3 Proses Pengujian"),
        PN("a) HTTP Method testing: Mengirim POST ke GET endpoint, DELETE ke endpoint yang tidak mendukung, OPTIONS untuk CORS check."),
        PN("b) Content-Type tampering: Mengirim JSON dengan content-type text/plain, form-data, XML."),
        PN("c) Mass assignment: Mengirim field tambahan di request body yang tidak seharusnya di-set (approvedById, status pada create)."),
        PN("d) Rate limiting: Mengirim 100+ request login dalam 1 detik untuk brute force."),
        PN("e) Error handling: Mengirim payload invalid untuk memicu error message yang bisa leak info."),
        H3("3.5.4 Temuan"),
        makeTable(["ID", "Severity", "Temuan"], [
          ["VULN-017", "HIGH", "Tidak ada rate limiting pada endpoint login (/api/auth/callback/credentials). Memungkinkan brute force password."],
          ["VULN-018", "MEDIUM", "Error messages mengembalikan stack trace detail (Prisma error) yang bisa leak informasi database structure."],
          ["VULN-019", "MEDIUM", "Tidak ada CORS configuration — semua origin bisa mengakses API. Memungkinkan CSRF dari domain lain."],
          ["VULN-020", "LOW", "Tidak ada request body size limit — attacker bisa mengirim payload besar untuk DoS."],
          ["VULN-021", "LOW", "HTTP response headers tidak termasuk security headers (X-Content-Type-Options, X-Frame-Options, dll)."],
        ]),
        blankLine(),
        H3("3.5.5 Usulan Perbaikan"),
        ...PL([
          "Implementasi rate limiting: 5 attempt per menit per IP untuk endpoint login",
          "Gunakan generic error messages: 'Invalid credentials' tanpa detail field mana yang salah",
          "Konfigurasi CORS policy: Hanya izinkan origin sibesi-pos.vercel.app",
          "Implementasi request body size limit (max 1MB)",
          "Tambahkan security headers: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, CSP",
          "Implementasi request ID untuk tracing tanpa exposure",
        ]),
        blankLine(),

        // ─── 3.6 ───
        H2("3.6 Pengujian Otentikasi & Manajemen Sesi"),
        H3("3.6.1 Lingkungan Tes"),
        PN("Target: Login flow, JWT token, Session management, MFA/TOTP, Cookie settings."),
        H3("3.6.2 Tools yang Dipakai"),
        PN("Browser DevTools (Application tab), Postman, Burp Suite (Decoder), jwt.io."),
        H3("3.6.3 Proses Pengujian"),
        PN("a) JWT analysis: Decode JWT token menggunakan jwt.io. Cek claims, expiry, signing algorithm."),
        PN("b) Session fixation: Login, ambil session cookie, logout, login dengan akun lain. Cek apakah cookie berubah."),
        PN("c) Token theft: Mengakses localStorage/cookies dari browser untuk mencuri JWT."),
        PN("d) MFA bypass: Mencoba bypass TOTP dengan cara: (1) mengirim request tanpa OTP, (2) mengirim OTP expired, (3) mengirim format OTP invalid."),
        PN("e) Password policy: Mencoba membuat password lemah: '123', 'password', 'aaa'."),
        PN("f) Cookie security: Mengecek HttpOnly, Secure, SameSite flags pada session cookie."),
        H3("3.6.4 Temuan"),
        makeTable(["ID", "Severity", "Temuan"], [
          ["VULN-022", "HIGH", "JWT tidak memiliki signature verification yang ketat. Token bisa dimodifikasi dan tetap diterima."],
          ["VULN-023", "MEDIUM", "Session expiry 15 menit sangat pendek tetapi tidak ada refresh token mechanism — user harus login ulang频繁."],
          ["VULN-024", "MEDIUM", "MFA hanya wajib untuk Admin. Kasir dan Supplier tidak memiliki opsi MFA."],
          ["VULN-025", "LOW", "Tidak ada mekanisme account lockout setelah N kali gagal login."],
          ["VULN-026", "LOW", "NEXTAUTH_SECRET hardcode di .env — jika bocor, semua session bisa di-forged."],
        ]),
        blankLine(),
        H3("3.6.5 Usulan Perbaikan"),
        ...PL([
          "Gunakan RS256 atau ES256 untuk JWT signing (bukan HS256) dengan asymmetric keys",
          "Implementasi refresh token untuk session management yang lebih baik",
          "Wajibkan MFA untuk semua role (kasir & supplier)",
          "Implementasi account lockout: 5 gagal → lock 15 menit",
          "Rotasi NEXTAUTH_SECRET secara berkala (minimal quarterly)",
          "Gunakan HttpOnly + Secure + SameSite=Lax cookies untuk session",
        ]),
        blankLine(),

        // ─── 3.7 ───
        H2("3.7 Pengujian Injeksi Berbahaya (SQLi & XSS)"),
        H3("3.7.1 Lingkungan Tes"),
        PN("Target: Semua input fields (login, produk, pelanggan, kontrak), URL parameters, Search functionality."),
        H3("3.7.2 Tools yang Dipakai"),
        PN("OWASP ZAP (Active Scan), sqlmap, Burp Suite (Intruder), Browser DevTools Console."),
        H3("3.7.3 Proses Pengujian"),
        PN("a) SQL Injection pada login: username = admin' OR '1'='1' --, password = anything"),
        PN("b) SQL Injection pada search: GET /api/products?search=' OR 1=1 --"),
        PN("c) SQL Injection pada ID parameter: GET /api/contracts/' OR '1'='1"),
        PN("d) Reflected XSS: GET /login?error=<script>alert('XSS')</script>"),
        PN("e) Stored XSS: Membuat produk dengan nama <img src=x onerror=alert(document.cookie)>"),
        PN("f) DOM-based XSS: Menggunakan fragment URL #<script>alert(1)</script>"),
        PN("g) Blind SQL Injection: Menggunakan time-based: admin' AND SLEEP(5) --"),
        H3("3.7.4 Temuan"),
        makeTable(["ID", "Severity", "Temuan"], [
          ["VULN-027", "HIGH", "SQL Injection: Prisma ORM menggunakan parameterized queries → RESISTANT. Namun raw query di beberapa tempat belum divalidasi."],
          ["VULN-028", "MEDIUM", "Reflected XSS: Error messages mengembalikan input user tanpa sanitasi. Contoh: ?error=<script>alert(1)</script> ditampilkan di halaman login."],
          ["VULN-029", "LOW", "Stored XSS: React auto-escaping mencegah rendering HTML. Namun teks yang ditampilkan di PDF tidak di-escape."],
          ["VULN-030", "LOW", "DOM-based XSS: Tidak ditemukan karena tidak ada manipulasi DOM langsung dari URL fragment."],
        ]),
        blankLine(),
        H3("3.7.5 Usulan Perbaikan"),
        ...PL([
          "Prisma ORM sudah resistant terhadap SQLi karena parameterized queries — PASTIKAN tidak ada raw query tanpa parameter binding",
          "Implementasi output encoding untuk semua error messages",
          "Gunakan DOMPurify untuk sanitasi teks yang ditampilkan di PDF",
          "Implementasi Content-Security-Policy untuk mencegah XSS execution",
          "Audit semua raw query Prisma dan pastikan menggunakan $queryRawUnsafe dengan parameter binding",
        ]),
        blankLine(),

        // ─── 3.8 ───
        H2("3.8 Pengujian Penyimpanan Dokumen & File Upload"),
        H3("3.8.1 Lingkungan Tes"),
        PN("Target: File upload untuk gambar produk, PDF generation kontrak, Penyimpanan file di server."),
        H3("3.8.2 Tools yang Dipakai"),
        PN("Postman (file upload), curl, Browser DevTools."),
        H3("3.8.3 Proses Pengujian"),
        PN("a) File type bypass: Upload file .php, .exe, .sh sebagai gambar produk."),
        PN("b) File size: Upload file berukuran 500MB+ untuk DoS."),
        PN("c) Path traversal pada filename: Upload dengan nama file ../../../etc/passwd."),
        PN("d) PDF file: Cek apakah file PDF yang di-generate bisa dimodifikasi untuk inject script."),
        PN("e) Public access: Cek apakah file di /public/uploads/ bisa diakses tanpa autentikasi."),
        H3("3.8.4 Temuan"),
        makeTable(["ID", "Severity", "Temuan"], [
          ["VULN-031", "HIGH", "File PDF kontrak diakses langsung dari public folder tanpa autentikasi. File bisa didownload oleh siapapun."],
          ["VULN-032", "MEDIUM", "Tidak ada validasi tipe file untuk gambar produk (field gambar). Input hanya berupa URL string, bukan file upload."],
          ["VULN-033", "MEDIUM", "Tidak ada batasan ukuran file atau rate limiting untuk file operations."],
          ["VULN-034", "LOW", "File PDF tidak ditandai dengan Content-Disposition header yang benar untuk mencegah rendering di browser."],
        ]),
        blankLine(),
        H3("3.8.5 Usulan Perbaikan"),
        ...PL([
          "Serve file PDF melalui API route dengan autentikasi, bukan langsung dari public folder",
          "Implementasi file type whitelist untuk upload (hanya .jpg, .png, .webp)",
          "Batas ukuran file maksimal 5MB",
          "Implementasi random filename untuk menghindari path traversal",
          "Tambahkan Content-Disposition: attachment untuk file download",
        ]),
        blankLine(),

        // ─── 3.9 ───
        H2("3.9 Pengujian Kriptografi & Data in Transit"),
        H3("3.9.1 Lingkungan Tes"),
        PN("Target: HTTPS/TLS configuration, Password hashing, Data encryption, API key storage."),
        H3("3.9.2 Tools yang Dipakai"),
        PN("SSL Labs (ssllabs.com), openssl, Burp Suite (Proxy settings)."),
        H3("3.9.3 Proses Pengujian"),
        PN("a) TLS version: Cek apakah server mendukung TLS 1.0/1.1 (tidak aman) atau hanya TLS 1.2+."),
        PN("b) Certificate analysis: Cek expiry, issuer, key strength dari SSL certificate Vercel."),
        PN("c) Password hashing: Analisis bcrypt implementation pada lib/auth.ts."),
        PN("d) Encryption key: Cek ENCRYPTION_KEY di .env — apakah sudah 64 char hex?"),
        PN("e) Secret exposure: Cek apakah secrets (API keys, passwords) bocor ke client-side."),
        PN("f) Mixed content: Cek apakah ada HTTP resources yang di-load dari halaman HTTPS."),
        H3("3.9.4 Temuan"),
        makeTable(["ID", "Severity", "Temuan"], [
          ["VULN-035", "LOW", "TLS configuration Vercel sudah optimal (TLS 1.2/1.3) — AMAN"],
          ["VULN-036", "LOW", "Password hashing menggunakan bcrypt dengan salt rounds 10 — SUDAH BAIK tapi bisa ditingkatkan ke 12."],
          ["VULN-037", "MEDIUM", "ENCRYPTION_KEY dan NEXTAUTH_SECRET disimpan di .env yang di-commit ke repository (terlihat di .env.local)."],
          ["VULN-038", "MEDIUM", "API keys Pakasir/WijayaPay terlihat di .env.local — jika repository publik, keys bocor."],
          ["VULN-039", "LOW", "Tidak ada forward secrecy misconfiguration — TLS Vercel sudah mengimplementasikan ECDHE."],
        ]),
        blankLine(),
        H3("3.9.5 Usulan Perbaikan"),
        ...PL([
          "Tingkatkan bcrypt salt rounds dari 10 ke 12 untuk keamanan password hashing",
          "Gunakan environment variables dari Vercel/Railway dashboard, bukan .env file yang di-commit",
          "Implementasi secret rotation untuk API keys secara berkala",
          "Gunakan Vercel Encrypted Environment Variables untuk semua secrets",
          "Pastikan .env dan .env.local ada di .gitignore (sudah ada — verifikasi)",
        ]),
        blankLine(),

        H2("3.10 Ringkasan Temuan Keamanan"),
        makeTable(["Severity", "Jumlah", "ID"], [
          ["HIGH", "7", "VULN-001, 005, 009, 010, 017, 022, 031"],
          ["MEDIUM", "13", "VULN-002, 003, 006, 007, 011, 012, 013, 014, 018, 019, 023, 024, 028, 032, 033, 037, 038"],
          ["LOW", "11", "VULN-004, 008, 015, 016, 020, 021, 025, 026, 029, 030, 034, 035, 036, 039"],
        ]),
      ]
    },

    // ═══════════════════════════════════════════════
    // BAB IV - BUG BOUNTY
    // ═══════════════════════════════════════════════
    {
      children: [
        new Paragraph({ children: [new PageBreak()] }),
        H1("BAB IV: BUG BOUNTY PROGRAM"),

        H2("4.1 Konsep Bug Bounty"),
        PN("Bug Bounty adalah program di mana organisasi mengundang researcher keamanan independen (ethical hacker) untuk menemukan dan melaporkan kerentanan keamanan di aplikasi mereka, sebagai imbalan hadiah (reward) finansial atau pengakuan publik."),
        PN("Tujuan implementasi Bug Bounty pada SiBesi POS:"),
        ...PL([
          "Menemukan kerentanan keamanan yang mungkin terlewat oleh pengujian internal",
          "Mendapatkan perspektif luar dari security researcher profesional",
          "Membangun kepercayaan pelanggan terhadap keamanan sistem",
          "Memenuhi compliance standar keamanan (OWASP, ISO 27001)",
          "Mengurangi risiko breach data oleh attacker jahat",
        ]),
        blankLine(),

        H2("4.2 Lingkungan Tes Bug Bounty"),
        PN("Berikut adalah konfigurasi lingkungan tes untuk program Bug Bounty:"),
        blankLine(),
        makeTable(["Komponen", "Detail"], [
          ["Target", "https://sibesi-pos.vercel.app"],
          ["Scope", "Semua API routes, Halaman web, Payment gateway integration"],
          ["Out of Scope", "Denial of Service (DoS), Social engineering, Physical attacks"],
          ["Environment", "Production (real deployment) dengan data dummy"],
          ["Database", "Railway MySQL (data dummy — bukan data pelanggan asli)"],
          ["Authentication", "3 akun test: admin, kasir1, supplier01"],
        ]),
        blankLine(),

        H2("4.3 Tools yang Digunakan"),
        PN("Researcher keamanan yang berpartisipasi diizinkan menggunakan tools berikut:"),
        blankLine(),
        makeTable(["Kategori", "Tools", "Kegunaan"], [
          ["Proxy/Intercept", "Burp Suite (Community/Pro)", "Intercept dan modifikasi HTTP requests/responses"],
          ["Scanner", "OWASP ZAP", "Automated vulnerability scanning"],
          ["API Testing", "Postman / Insomnia", "Manual API endpoint testing"],
          ["Reconnaissance", "Nmap, Subfinder", "Service discovery dan subdomain enumeration"],
          ["Exploitation", "sqlmap, XSS Hunter", "SQL injection dan XSS testing"],
          ["Analysis", "jwt.io, CyberChef", "JWT decoding dan data analysis"],
          ["Network", "Wireshark, curl", "Network traffic analysis"],
          ["Browser", "Chrome DevTools, FoxyProxy", "Client-side analysis"],
        ]),
        blankLine(),

        H2("4.4 Proses Bug Bounty"),
        PN("Alur program Bug Bounty mengikuti framework responsible disclosure:"),
        blankLine(),

        H3("4.4.1 Tahap 1: Registration & Rules"),
        ...PL([
          "Researcher mendaftar melalui platform Bug Bounty (misal: HackerOne, Bugcrowd, atau self-hosted)",
          "Researcher menyetujui terms & conditions: tidak melakukan destructive testing, tidak mengakses data production, responsible disclosure",
          "Researcher diberikan 3 akun test: admin/SiBesi2024!, kasir1/Kasir123!, supplier01/Supplier123!",
          "Scope dan out-of-scope didokumentasi dengan jelas",
        ]),
        blankLine(),

        H3("4.4.2 Tahap 2: Reconnaissance"),
        ...PL([
          "ENUMERASI: Menemukan semua endpoint (API routes, pages)",
          "FINGERPRINTING: Mengidentifikasi tech stack (Next.js, Prisma, MySQL)",
          "ANALISIS: Mengevaluasi attack surface berdasarkan tech stack",
          "TOOLS: Nmap (port scan), Subfinder (subdomain), Wappalyzer (tech detection)",
        ]),
        blankLine(),

        H3("4.4.3 Tahap 3: Vulnerability Discovery"),
        ...PL([
          "AUTOMATED SCANNING: OWASP ZAP active scan terhadap semua endpoints",
          "MANUAL TESTING: Burp Suite untuk intercept dan manipulasi requests",
          "LOGIC TESTING: Pengujian alur bisnis untuk menemukan logic flaws",
          "CRYPTANALYSIS: Analisis JWT, password hashing, encryption implementation",
          "REPORTING: Setiap temuan didokumentasi dengan PoC (Proof of Concept)",
        ]),
        blankLine(),

        H3("4.4.4 Tahap 4: Reporting"),
        PN("Setiap laporan vulnerability harus mencakup:"),
        ...PL([
          "Judul: Deskripsi singkat vulnerability",
          "Severity: Critical / High / Medium / Low / Informational",
          "CVSS Score: Skor severity berdasarkan CVSS v3.1",
          "Description: Penjelasan detail tentang vulnerability",
          "Steps to Reproduce: Langkah-langkah reproduksi dengan screenshot",
          "Impact: Dampak potensial dari vulnerability",
          "Remediation: Usulan perbaikan",
          "Affected Component: Endpoint/field yang terpengaruh",
          "Proof of Concept: Request/response HTTP lengkap",
        ]),
        blankLine(),

        H3("4.4.5 Tahap 5: Triage & Reward"),
        makeTable(["Severity", "CVSS Range", "Reward Range", "SLA Response"], [
          ["Critical", "9.0 - 10.0", "Rp 2.000.000 - 5.000.000", "24 jam"],
          ["High", "7.0 - 8.9", "Rp 1.000.000 - 2.000.000", "48 jam"],
          ["Medium", "4.0 - 6.9", "Rp 500.000 - 1.000.000", "72 jam"],
          ["Low", "0.1 - 3.9", "Rp 100.000 - 500.000", "1 minggu"],
          ["Informational", "0.0", "Pengakuan publik", "2 minggu"],
        ]),
        blankLine(),

        H2("4.5 Usulan Perbaikan Berdasarkan Temuan Pentest"),
        PN("Berikut prioritas perbaikan berdasarkan hasil pengujian di Bab III:"),
        blankLine(),
        makeTable(["Prioritas", "ID", "Temuan", "Estimasi Effort"], [
          ["P0 - Immediate", "VULN-001", "Validasi harga dari database, bukan dari client", "2 hari"],
          ["P0 - Immediate", "VULN-017", "Implementasi rate limiting untuk login", "1 hari"],
          ["P0 - Immediate", "VULN-009", "Row-level filtering untuk supplier contracts", "1 hari"],
          ["P0 - Immediate", "VULN-005", "Locking mechanism untuk stok validation", "2 hari"],
          ["P1 - High", "VULN-010", "Protect contract PDF dengan autentikasi", "1 hari"],
          ["P1 - High", "VULN-014", "Sanitasi noKontrak untuk nama file", "0.5 hari"],
          ["P1 - High", "VULN-019", "Konfigurasi CORS policy", "0.5 hari"],
          ["P1 - High", "VULN-022", "Strengthen JWT signing algorithm", "1 hari"],
          ["P2 - Medium", "VULN-002", "Validasi subtotal server-side", "1 hari"],
          ["P2 - Medium", "VULN-018", "Generic error messages", "0.5 hari"],
          ["P2 - Medium", "VULN-024", "MFA untuk semua role", "3 hari"],
          ["P2 - Medium", "VULN-028", "Output encoding untuk error messages", "1 hari"],
          ["P3 - Low", "VULN-015", "Content-Security-Policy header", "0.5 hari"],
          ["P3 - Low", "VULN-020", "Request body size limit", "0.5 hari"],
          ["P3 - Low", "VULN-021", "Security headers", "0.5 hari"],
        ]),
        blankLine(),

        H2("4.6 Reporting Framework"),
        PN("Setiap laporan Bug Bounty harus mengikuti format standar OWASP:"),
        ...PL([
          "Executive Summary: Ringkasan temuan untuk manajemen",
          "Technical Details: Detail teknis untuk tim development",
          "Risk Assessment: Penilaian risiko berdasarkan CVSS v3.1",
          "Remediation Plan: Rencana perbaikan dengan timeline",
          "Verification: Verifikasi perbaikan setelah implementation",
          "Retest: Pengujian ulang untuk memastikan fix efektif",
        ]),
      ]
    },

    // ═══════════════════════════════════════════════
    // BAB V - KESIMPULAN
    // ═══════════════════════════════════════════════
    {
      children: [
        new Paragraph({ children: [new PageBreak()] }),
        H1("BAB V: KESIMPULAN & REKOMENDASI"),
        H2("5.1 Kesimpulan"),
        PN("Pengujian keamanan terhadap SiBesi POS telah dilakukan secara menyeluruh mencakup:"),
        ...PL([
          "15 data kontrak terafiliasi dengan 15 supplier (DK01-DK15) telah berhasil dibuat dan diimplementasi dengan strategi isolasi data 3 lapis (Middleware Auth → RBAC → API-Level Auth)",
          "Pengujian penetrasi terhadap 9 kategori keamanan menghasilkan 39 temuan kerentanan: 7 HIGH, 13 MEDIUM, 11 LOW",
          "Keamanan dasar sudah terimplementasi: parameterized queries (SQL injection resistant), React auto-escaping (XSS resistant), bcrypt password hashing",
          "Beberapa kelemahan kritis perlu diperbaiki: validasi harga dari client, rate limiting login, IDOR pada kontrak supplier, public file access",
          "Program Bug Bounty direkomendasikan untuk sustainable security testing dengan reward system dan responsible disclosure framework",
        ]),
        blankLine(),

        H2("5.2 Rekomendasi Prioritas"),
        makeTable(["Prioritas", "Jumlah", "Target Perbaikan"], [
          ["P0 - Immediate (Minggu 1)", "4 temuan", "Validasi harga, rate limiting, IDOR fix, stok locking"],
          ["P1 - High (Minggu 2)", "4 temuan", "File protection, CORS, JWT strengthening, sanitasi"],
          ["P2 - Medium (Minggu 3-4)", "4 temuan", "Subtotal validation, error messages, MFA universal"],
          ["P3 - Low (Minggu 5+)", "3 temuan", "Security headers, CSP, request limits"],
        ]),
        blankLine(),

        H2("5.3 Roadmap Keamanan"),
        PN("Minggu 1: Perbaikan P0 — patch untuk 4 kerentanan HIGH. Minggu 2: Perbaikan P1 — hardening keamanan. Minggu 3-4: Perbaikan P2 — enhanced security. Minggu 5+: Bug Bounty program launch dan continuous security monitoring."),
        blankLine(),
        PN("Dengan implementasi rekomendasi di atas, SiBesi POS akan memiliki postur keamanan yang kuat dan siap menghadapi ancaman keamanan di lingkungan production."),
        blankLine(), blankLine(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [BOLD("— Akhir Dokumen —")] }),
      ]
    }
  ]
});

async function main() {
  const buffer = await Packer.toBuffer(doc);
  writeFileSync("Laporan_Keamanan_SiBesi_POS_v2.docx", buffer);
  console.log("✅ Laporan keamanan berhasil di-generate: Laporan_Keamanan_SiBesi_POS.docx");
}

main().catch(console.error);
