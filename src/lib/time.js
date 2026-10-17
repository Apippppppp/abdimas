const DAY = 86400;

const toSeconds = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 3600 + m * 60;
};

const nowSeconds = (d) => d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();

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
