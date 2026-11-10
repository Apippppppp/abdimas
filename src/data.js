export const SITE = {
  name: 'Masjid Al-Falah',
  location: 'Bekasi',
  pageTitle: 'Masjid Al-Falah | Layar Digital',
  heading: 'Portal Informasi Masjid',
  footer: 'Mari makmurkan masjid dengan ilmu, ibadah, dan kepedulian bersama.',
  // Jadwal, petugas, dan nominal berikut berasal dari contoh desain.
  sampleData: true,
  sampleLabel: 'Jadwal, petugas & nominal contoh',
};

export const WEEKLY_SCHEDULE = [
  { day: 'Senin', title: 'Kajian Tafsir', detail: 'QS. Pilihan', time: 'Ba’da Magrib', duration: '± 45 menit', kind: 'book' },
  { day: 'Selasa', title: 'Tahsin Al-Qur’an', detail: 'Umum', time: '19.30–21.00', duration: 'WIB', kind: 'book' },
  { day: 'Rabu', title: 'Pengajian Ibu-ibu', detail: 'Fiqih Keluarga', time: '09.00–11.00', duration: 'WIB', kind: 'group' },
  { day: 'Kamis', title: 'Kajian Islam Tematik', detail: 'Umum', time: 'Ba’da Magrib', duration: '± 45 menit', kind: 'book' },
  { day: 'Jumat', title: 'Kajian Menjelang Sholat Jumat', time: '11.30–12.00', duration: 'WIB', kind: 'mosque' },
  { day: 'Sabtu', title: 'Kajian Remaja Masjid', detail: 'Pemuda & Pemudi', time: '19.30–21.00', duration: 'WIB', kind: 'group' },
  { day: 'Minggu', title: 'Kajian Subuh', detail: 'Riyadhus Shalihin', time: 'Ba’da Subuh', duration: '± 45 menit', kind: 'book' },
];

export const FRIDAY_ROSTER = {
  khatib: 'Ust. Dr. Ahmad Fauzi, Lc., M.A.',
  imam: 'Ust. H. Rizal Maulana, M.Pd.',
  muadzin: 'Ust. Fajar Santoso',
  bilal: 'Ust. Ibrahim Al-Hakim',
};

export const BALANCES = [
  { label: 'Kas Operasional Masjid', amount: 32500000 },
  { label: 'Kas Ambulance', amount: 18750000 },
  { label: 'Kas Dana Pembangunan', amount: 275000000 },
  { label: 'Kas PHBI', detail: 'Peringatan Hari Besar Islam', amount: 27500000 },
];

export const CARPET_DONATION_TOTAL = 48750000;

export const PROGRAMS = {
  ambulance: {
    label: 'Layanan Ambulance Gratis',
    note: 'RW 14 & RW 15',
    category: 'Layanan Masjid',
    title: 'Layanan Ambulance Gratis',
    description: 'Untuk warga di lingkungan RW 14 dan RW 15.',
  },
  wakaf: {
    label: 'Program Wakaf',
    category: 'Program Masjid',
    title: 'Program Wakaf',
    description: 'Informasi program wakaf tersedia melalui pengurus masjid.',
    image: { src: 'masjid.webp' },
  },
  qurban: {
    label: 'Program Qurban',
    category: 'Program Masjid',
    title: 'Program Qurban',
    description: 'Informasi pendaftaran qurban tersedia melalui pengurus masjid.',
  },
  carpet: {
    label: 'Program Donasi',
    note: 'Pengadaan Karpet Tahap Kedua',
    category: 'Program Donasi Berjalan',
    title: 'Pengadaan\nKarpet Tahap Kedua',
    image: { src: 'karpet-masjid.webp' },
  },
  donationLabel: 'Total Dana Terkumpul',
  donationTotal: CARPET_DONATION_TOTAL,
};

export const GALLERY = {
  label: 'Galeri Kegiatan',
  category: 'Dokumentasi Masjid',
  title: 'Galeri Kegiatan',
  photos: [],
};

export const SECTION_TITLES = {
  schedule: 'Jadwal\nKegiatan Rutin',
  scheduleSubtitle: 'Pengajian / Kajian Mingguan Masjid',
  friday: 'Jadwal Khatib &\nSholat Jumat',
  finances: 'Saldo Keuangan',
  verses: 'Ayat Hari Ini',
};

export const DAILY_VERSES = [
  {
    arab: 'وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مَخْرَجًا',
    translation: 'Barangsiapa bertakwa kepada Allah niscaya Dia akan membukakan jalan keluar baginya.',
    ref: 'QS. At-Talaq (65): 2 · Cuplikan',
    source: 'https://quran.com/id/perceraian/2',
  },
  {
    arab: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Maka sesungguhnya bersama kesulitan ada kemudahan.',
    ref: 'QS. Asy-Syarh (94): 5',
    source: 'https://quran.com/id/melapangkan/5',
  },
  {
    arab: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    translation: 'Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu. Bersyukurlah kepada-Ku, dan janganlah kamu ingkar kepada-Ku.',
    ref: 'QS. Al-Baqarah (2): 152',
    source: 'https://quran.com/id/sapi-betina/152',
  },
];

export function dailyVerse(dateKey, overrides, rotation = DAILY_VERSES) {
  const custom = overrides[dateKey];
  if ([custom?.arab, custom?.translation, custom?.ref].every((value) => typeof value === 'string' && value.trim())) {
    return custom;
  }

  const dayNumber = Math.floor(Date.parse(dateKey) / 86_400_000);
  const verses = rotation?.length ? rotation : DAILY_VERSES;
  const index = ((dayNumber % verses.length) + verses.length) % verses.length;
  return verses[index];
}
