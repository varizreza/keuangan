# Keuangan Keluarga — versi aplikasi HP (PWA)

Spreadsheet Google tetap menjadi database. Apps Script tetap menjadi server. Yang baru: tampilan HP
dipasang di layar utama Android/iPhone, bisa dibuka offline, dan catatan offline dikirim otomatis saat online.

## Isi folder
- Code.gs, appsscript.json → ke Apps Script
- index.html, config.js, sw.js, manifest.webmanifest, icons/ → ke hosting statis (gratis)

## Langkah 1 — Apps Script
1. Ganti isi Code.gs dan appsscript.json (Project Settings → centang "Show appsscript.json").
2. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone. Deploy.
3. Salin URL yang berakhiran /exec. (Setiap kali Code.gs diubah: Deploy → Manage deployments → Edit → New version.)

## Langkah 2 — Hosting (pilih satu)
- Netlify: buka app.netlify.com/drop, seret folder PWA (tanpa Code.gs). Selesai, Anda dapat alamat https.
- GitHub Pages / Cloudflare Pages: unggah isi folder yang sama.
Sebelum mengunggah, buka config.js dan isi API_URL dengan URL /exec dari Langkah 1.

## Langkah 3 — Pasang di HP
- Android (Chrome): buka alamat PWA → tombol "Pasang" muncul, atau menu ⋮ → Pasang aplikasi.
- iPhone/iPad (Safari saja): ketuk Bagikan → Tambahkan ke Layar Utama.
Buka sekali dengan internet agar semua file tersimpan. Setelah itu aplikasi bisa dibuka tanpa internet.

## Cara kerja offline
- Dibuka offline: tampil data terakhir yang tersinkron.
- Transaksi baru/ubah transaksi saat offline: disimpan di HP (tanda "Menunggu kirim"), terkirim otomatis saat online.
- Fitur lain (hapus, tagihan, anggaran, dll.) butuh internet.
- Keluar dari aplikasi menghapus salinan data di HP.

## Memperbarui aplikasi
Ubah index.html lalu naikkan VERSION di sw.js (v1 → v2) dan unggah ulang.

## Catatan keamanan
Akses "Anyone" hanya membuka pintu server; semua data tetap butuh PIN. Pakai PIN 6-8 angka. Percobaan salah dibatasi (5x lalu 5 menit).
