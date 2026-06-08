# UI Direction

## Tema
Warm industrial minimalism untuk toko material:
- latar krem hangat
- kartu putih dengan border batu muda
- aksen utama batu gelap dan amber
- layout lega, fokus ke data, tanpa ornamen berlebih

## Shell
- admin melihat sidebar penuh untuk dashboard, produk, stok, kontrak, pelanggan, dan laporan
- kasir hanya melihat workspace POS
- profile card selalu berada di kanan atas dan menjadi titik akses logout

## Komponen
- card membulat besar dengan bayangan tipis
- tombol utama gelap agar aksi utama langsung terbaca
- input dan select memakai latar lembut agar form panjang tetap ringan dipindai
- badge dipakai sebagai penanda status, bukan dekorasi

## Halaman
- POS menonjolkan pencarian, grid produk, keranjang, dan histori transaksi
- Produk dan Pelanggan memakai split layout: form kiri, daftar kanan
- Stok memakai aksi per item langsung di tabel
- Kontrak memakai form pembuatan di kiri dan panel keputusan di kanan

## Catatan
Implementasi visual mengikuti arah ini. Pembuatan mockup bitmap dengan GPT Image 2 belum bisa dijalankan di sesi ini karena tool image generation tidak tersedia dan `OPENAI_API_KEY` belum terpasang.
