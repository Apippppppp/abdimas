// Konten statis dari DESIGN.md. Ganti dengan sumber data (API/CMS) saat backend siap.

export const MASJID = { name: 'Masjid Al-Falah', location: 'Jakarta Selatan' };

// Waktu sholat Jakarta (sumber: DESIGN.md §8). Ganti dengan API Bimas Islam saat tersedia.
export const PRAYER_TIMES = [
  { name: 'Subuh', time: '04:28' },
  { name: 'Dzuhur', time: '11:53' },
  { name: 'Ashar', time: '15:10' },
  { name: 'Maghrib', time: '17:47' },
  { name: 'Isya', time: '19:01' },
];

export const KAJIAN = {
  schedule: 'Rabu, 20.00 – 21.00 WIB',
  title: 'Kitab Riyadhus Shalihin',
};

export const ANNOUNCEMENTS = [
  'Kajian rutin malam ini pukul 20.00 WIB bersama Ust. Ahmad Fauzi, Lc. – Kitab Riyadhus Shalihin',
  'Penerimaan dan penyaluran qurban akan dibuka mulai 1 Dzulhijjah 1448 H.',
  'Mari bersama memakmurkan masjid.',
];

export const QUOTE = {
  text: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lain.',
  source: 'HR. Ahmad',
};

export const QRIS = {
  nmid: 'ID2026000123456',
  bank: 'Bank Syariah Indonesia (BSI)',
  account: '7222 3333 4444',
  holder: 'a.n. Masjid Al-Falah Jakarta Selatan',
};

export const DONATION = {
  period: 'Periode Oktober 2026',
  total: 158780000,
  growth: 12,
  categories: [
    { key: 'infaq', label: 'Infaq', amount: 64250000 },
    { key: 'sedekah', label: 'Sedekah', amount: 32180000 },
    { key: 'wakaf', label: 'Wakaf', amount: 28500000 },
    { key: 'zakat', label: 'Zakat', amount: 18750000 },
  ],
  others: [
    { label: 'Operasional', amount: 10100000 },
    { label: 'Lainnya', amount: 5000000 },
  ],
};

export const VERSE = {
  arab: 'وَمَا تُنفِقُوا مِنْ خَيْرٍ فَإِنَّ اللَّهَ بِهِ عَلِيمٌ',
  translation: 'Dan apa saja yang kamu infakkan dari kebaikan, maka sesungguhnya Allah mengetahuinya.',
  ref: 'QS. Al-Baqarah: 273',
};

export const QURBAN = {
  badge: 'Menjelang Idul Adha',
  description: 'Tunaikan qurban, hadirkan kebahagiaan bagi yang membutuhkan.',
  collected: 10100000,
  target: 50000000,
};

export const ARTICLES = [
  { badge: 'KAJIAN', title: 'Keutamaan Sholat Berjamaah di Masjid', date: '12 Oktober 2026', image: '/articles/artikel.webp' },
  { badge: 'AKHLAK', title: "Adab Membaca Al-Qur'an", date: '10 Oktober 2026', image: '/articles/artikel.webp' },
  { badge: 'HIKMAH', title: 'Makna Sabar dalam Kehidupan Sehari-hari', date: '8 Oktober 2026', image: '/articles/artikel.webp' },
  { badge: 'FIQIH', title: 'Amalan Ringan, Pahala Besar', date: '5 Oktober 2026', image: '/articles/artikel.webp' },
];
