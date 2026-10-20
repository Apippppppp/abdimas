const DAY = 86400;

const toSeconds = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 3600 + m * 60;
};

const nowSeconds = (d) => d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();

// Jadwal sholat ditulis dalam WIB, jadi pembacaan waktu live juga dipaksa ke zona itu.
const WIB = 'Asia/Jakarta';
const wibFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: WIB,
  hourCycle: 'h23',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export function wibSeconds(d) {
  const [h, m, s] = wibFmt.format(d).split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

// Indeks sholat yang sedang berlangsung (0..n-1), atau -1 bila di luar jendela [waktu sholat, +menit).
export function livePrayerIndex(times, now, minutes) {
  const s = wibSeconds(now);
  return times.findIndex((p) => {
    const since = s - toSeconds(p.time);
    return since >= 0 && since < minutes * 60;
  });
}

// Detik dari `now` sampai `hhmm` berikutnya. Lewat tengah malam dihitung ke hari berikutnya.
// ponytail: memakai zona waktu perangkat, bukan WIB paksa. Tambah timeZone saat zona TV berbeda.
export function secondsUntil(hhmm, now) {
  const diff = toSeconds(hhmm) - nowSeconds(now);
  return diff > 0 ? diff : diff + DAY;
}

// Indeks sholat berikutnya: yang selisih detiknya paling kecil.
export function nextPrayerIndex(times, now) {
  let best = 0;
  times.forEach((p, i) => {
    if (secondsUntil(p.time, now) < secondsUntil(times[best].time, now)) best = i;
  });
  return best;
}

// Dibulatkan ke atas per menit, supaya hitung mundur tidak menampilkan "24 menit" saat tersisa 24 menit 33 detik.
export function formatRemaining(sec) {
  const total = Math.ceil(sec / 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h} jam ${String(m).padStart(2, '0')} menit` : `${m} menit`;
}
