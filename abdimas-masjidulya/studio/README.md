# Sanity Studio Masjid Al-Falah

Studio mengelola konten dashboard Vue di root repositori. Konten tersimpan di dataset `production` proyek `hlbvzbbi`.

## Edit dan publikasikan konten

Dari root repositori:

```sh
cd abdimas-masjidulya/studio
npm ci
npm run dev
```

Buka Studio di <http://localhost:3333> dan masuk dengan akun Sanity yang memiliki akses ke proyek. Pilih bagian di **Konten Dashboard**, edit, lalu klik **Publish**.

| Bagian | Konten yang dapat diedit |
| --- | --- |
| Identitas Masjid | Nama, lokasi, judul dashboard dan tab browser, pesan penutup, penanda data contoh |
| Kegiatan Rutin | Judul, subjudul, dan daftar kegiatan mingguan |
| Petugas Jumat | Judul dan nama khatib, imam, muadzin, dan bilal |
| Saldo Keuangan | Judul, nama kas, keterangan, dan saldo |
| Layanan, Program, dan Donasi | Ambulance, wakaf, qurban, donasi, foto program, dan nominal donasi |
| Galeri Kegiatan | Judul, foto, keterangan, dan tanggal kegiatan |
| Ayat Hari Ini | Ayat rotasi dan ayat khusus berdasarkan tanggal WIB |

Jalankan `npm run dev` dari root repositori di terminal lain untuk membuka dashboard di <http://localhost:5173>. Dashboard mengambil konten publik saat dibuka dan mengecek pembaruan setiap menit. Jika Sanity tidak dapat diakses, layar mempertahankan konten terakhir yang berhasil dimuat atau memakai cadangan lokal saat pertama kali dibuka.

Origin localhost sudah terdaftar. Untuk domain hosting dashboard, tambahkan origin yang sesuai di CORS Sanity tanpa kredensial, dari folder Studio:

```sh
npx sanity cors add https://domain-dashboard-anda --no-credentials
```

## Impor awal

`npm run seed:check` membaca sumber lokal tanpa menulis ke Sanity. `npm run seed` memakai sesi Sanity CLI untuk mengunggah foto dan membuat dokumen yang belum ada. Dokumen yang sudah terbit maupun yang masih berupa draf dilewati saat skrip dijalankan ulang.

Sumber impor adalah `src/data.js`, `public/ayat-hari-ini.json`, dan foto program di `public/` dari root repositori. Impor awal memuat 7 kegiatan, 4 saldo, 3 ayat rotasi, 1 ayat bertanggal, dan 2 foto program. Galeri dimulai kosong. Penanda data contoh mengikuti sumber dan dapat dimatikan setelah jadwal, petugas, saldo, dan nominal donasi diverifikasi.
