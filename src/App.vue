<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  PhMosque, PhSunHorizon, PhSun, PhMoonStars, PhCheck, PhClock, PhMapPin, PhBookOpen,
  PhWallet, PhHandHeart, PhBuildings, PhPiggyBank, PhHandCoins,
  PhCow, PhBooks, PhCalendarBlank, PhSpeakerHigh,
  PhCaretDown, PhCaretLeft, PhCaretRight,
  PhImages, PhX,
} from '@phosphor-icons/vue';
import { MASJID, PRAYER_TIMES, KAJIAN, ANNOUNCEMENTS, QRIS, DONATION, VERSE, QURBAN, ARTICLES, GALLERY } from './data.js';
import { secondsUntil, nextPrayerIndex, formatRemaining, livePrayerIndex } from './lib/time.js';

// Kanvas tetap 1672x941. Seluruh isi diskalakan dengan satu transform agar proporsi tidak berubah.
const W = 1672;
const H = 941;
// Skala seragam agar teks tidak melar. Kanvas virtual mengisi seluruh viewport,
// jadi tidak ada bagian yang terpotong; ruang ekstra dibagi ke layout lewat fr.
const vw = ref(innerWidth);
const vh = ref(innerHeight);
const fitScale = computed(() => Math.min(vw.value / W, vh.value / H));
const onResize = () => {
  vw.value = innerWidth;
  vh.value = innerHeight;
};

const now = ref(new Date());
let timer;
onMounted(() => {
  addEventListener('resize', onResize);
  timer = setInterval(() => (now.value = new Date()), 1000);
});
onUnmounted(() => {
  removeEventListener('resize', onResize);
  clearInterval(timer);
});

const pad = (n) => String(n).padStart(2, '0');
const clock = computed(() => ({
  hm: `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}`,
  s: `:${pad(now.value.getSeconds())}`,
}));

const masehi = computed(() =>
  now.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
);
const hijriFmt = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' });
const hijri = computed(() => hijriFmt.format(now.value).replace(' AH', ' H'));

const nextIdx = computed(() => nextPrayerIndex(PRAYER_TIMES, now.value));
const next = computed(() => PRAYER_TIMES[nextIdx.value]);
const remaining = computed(() => formatRemaining(secondsUntil(next.value.time, now.value)));

// ---------- Live streaming saat waktu sholat ----------
// Seluruh layar diganti embed YouTube selama LIVE_MIN menit sejak azan,
// kartu jam tetap menempel di atasnya selama durasi yang sama.
const LIVE_MIN = 20;
// ponytail: mute=1 supaya autoplay tidak diblokir browser. Hapus kalau peramban izinkan suara autoplay.
// modestbranding + controls=0 membuang logo/tulisan YouTube dari frame.
const LIVE_EMBED =
  'https://www.youtube.com/embed/OcOyJXKv3T4?autoplay=1&mute=1&rel=0&modestbranding=1&controls=0&playsinline=1';
const liveIdx = computed(() => livePrayerIndex(PRAYER_TIMES, now.value, LIVE_MIN));
const live = computed(() => liveIdx.value !== -1);
// Saat live dipaksa lewat tombol manual bisa jadi bukan jam sholat — label jatuh ke "Live Streaming".
const livePrayerLabel = computed(() => {
  const p = PRAYER_TIMES[liveIdx.value];
  return p ? `Waktu Sholat ${p.name} · ${p.time} WIB` : 'Live Streaming';
});
const livePrayerIcon = computed(() => (liveIdx.value >= 0 ? PRAYER_ICON[PRAYER_TIMES[liveIdx.value].name] : null));

const WIB = 'Asia/Jakarta';
const liveTimeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: WIB, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit',
});
const liveDateFmt = new Intl.DateTimeFormat('id-ID', {
  timeZone: WIB, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});
const liveHijriFmt = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
  timeZone: WIB, day: 'numeric', month: 'long', year: 'numeric',
});
const liveTime = computed(() => liveTimeFmt.format(now.value));
const liveDate = computed(() => liveDateFmt.format(now.value));
const liveHijri = computed(() => liveHijriFmt.format(now.value).replace(' AH', ' H'));

// Sholat sebelum `nextIdx` sudah lewat. Saat nextIdx 0 (setelah Isya), tidak ada yang lewat di hari ini.
const rowState = (i) => {
  if (i === nextIdx.value) return 'active';
  return nextIdx.value > 0 && i < nextIdx.value ? 'passed' : 'upcoming';
};
const rowRemaining = (p) => formatRemaining(secondsUntil(p.time, now.value));

const PRAYER_ICON = { Subuh: PhSunHorizon, Dzuhur: PhSun, Ashar: PhSun, Maghrib: PhSunHorizon, Isya: PhMoonStars };
const CAT_ICON = { infaq: PhPiggyBank, sedekah: PhHandHeart, wakaf: PhBuildings, zakat: PhHandCoins };

const rp = (n) => `Rp ${n.toLocaleString('id-ID')}`;
const qurbanPct = Math.round((QURBAN.collected / QURBAN.target) * 100);
const barReady = ref(false);
onMounted(() => requestAnimationFrame(() => (barReady.value = true)));

// Lottie Idul Adha di card Qurban — iduladha.json diputar via lottie-web (dynamic import biar Vite tidak gagal resolve di dev)
const qurbanLottie = ref(null);
let qurbanAnim = null;
const loadQurbanLottie = async () => {
  if (!qurbanLottie.value || qurbanAnim) return;
  try {
    const mod = await import('lottie-web');
    const lottie = mod.default ?? mod;
    const data = await fetch('/iduladha.json').then((r) => r.json());
    qurbanAnim = lottie.loadAnimation({
      container: qurbanLottie.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: data,
    });
  } catch (e) {
    // fallback: biarkan <img> di dalam div yang tetap tampil
    console.warn('Lottie qurban gagal', e);
  }
};
onMounted(() => loadQurbanLottie());
onUnmounted(() => { try { qurbanAnim?.destroy(); } catch {} });

const tickerText = ANNOUNCEMENTS.join('   •   ');
const slides = [...ARTICLES, ...ARTICLES];
const gallerySlides = [...GALLERY, ...GALLERY];

const activePhoto = ref(null);
const openPhoto = (item) => (activePhoto.value = item);
const closePhoto = () => (activePhoto.value = null);

// Periode keuangan. Nominal masih statis (data.js), jadi ganti periode hanya mengubah label
// sampai backend menyediakan data per bulan.
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const period = ref({ year: 2026, month: 9 });
const periodLabel = computed(() => `${MONTHS[period.value.month]} ${period.value.year}`);
const pickerOpen = ref(false);
const pickerYear = ref(period.value.year);
const periodWrap = ref(null);
const togglePicker = () => {
  pickerYear.value = period.value.year;
  pickerOpen.value = !pickerOpen.value;
};
const pickPeriod = (month) => {
  period.value = { year: pickerYear.value, month };
  pickerOpen.value = false;
};
const onDocClick = (e) => {
  if (pickerOpen.value && !periodWrap.value?.contains(e.target)) pickerOpen.value = false;
};
const onKey = (e) => {
  if (e.key === 'Escape') {
    pickerOpen.value = false;
    donateCat.value = null;
    activePhoto.value = null;
  }
};

// Dummy QR untuk tampilan saja, tidak bisa discan. Ganti dengan QR asli dari PJP/bank.
const QR_N = 25;
const QR_FINDERS = [{ x: 0, y: 0 }, { x: QR_N - 7, y: 0 }, { x: 0, y: QR_N - 7 }];
const qrCells = (() => {
  let seed = 7;
  const cells = [];
  for (let y = 0; y < QR_N; y++) {
    for (let x = 0; x < QR_N; x++) {
      const inFinder = QR_FINDERS.some((f) => x >= f.x && x < f.x + 7 && y >= f.y && y < f.y + 7);
      seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
      if (!inFinder && seed % 2 === 0) cells.push({ x, y });
    }
  }
  return cells;
})();

// Simulasi donasi: pilih kategori, isi nominal, "bayar" (tanpa pembayaran sungguhan).
const DONATE_PRESETS = [10000, 25000, 50000, 100000];
const donateCat = ref(null);
const donateForm = ref({ nama: '', jumlah: 50000 });
// Total dan per kategori yang tampil. Bertambah saat simulasi donasi berhasil.
const totals = ref({
  total: DONATION.total,
  cats: Object.fromEntries(DONATION.categories.map((c) => [c.key, c.amount])),
});
const notice = ref(null);
const noticeLeft = ref(4);
const NOTICE_MS = 4000; // harus sama dengan durasi `drain` di CSS
let noticeTimer;
let noticeTick;
const catLabel = (key) => DONATION.categories.find((c) => c.key === key)?.label;
const jumlahValid = computed(() => Number.isInteger(donateForm.value.jumlah) && donateForm.value.jumlah >= 1000);
const openDonate = (key) => (donateCat.value = key);
const closeDonate = () => (donateCat.value = null);
const submitDonate = () => {
  if (!jumlahValid.value) return;
  const key = donateCat.value;
  const jumlah = donateForm.value.jumlah;
  totals.value.total += jumlah;
  totals.value.cats[key] += jumlah;
  notice.value = { id: Date.now(), nama: donateForm.value.nama.trim() || 'Hamba Allah', tipe: catLabel(key), jumlah };
  clearTimeout(noticeTimer);
  clearInterval(noticeTick);
  noticeLeft.value = NOTICE_MS / 1000;
  noticeTick = setInterval(() => (noticeLeft.value = Math.max(0, noticeLeft.value - 1)), 1000);
  noticeTimer = setTimeout(() => {
    notice.value = null;
    clearInterval(noticeTick);
  }, NOTICE_MS);
  closeDonate();
};
onUnmounted(() => {
  clearTimeout(noticeTimer);
  clearInterval(noticeTick);
});
onMounted(() => {
  addEventListener('click', onDocClick);
  addEventListener('keydown', onKey);
});
onUnmounted(() => {
  removeEventListener('click', onDocClick);
  removeEventListener('keydown', onKey);
});
</script>

<template>
  <div class="viewport">
    <div
      class="stage"
      :style="{
        width: `${vw / fitScale}px`,
        height: `${vh / fitScale}px`,
        transform: `scale(${fitScale})`,
      }"
    >
      <!-- Panel kiri -->
      <aside class="left">
        <header class="ident">
          <PhMosque class="gold" :size="40" />
          <div>
            <h1>{{ MASJID.name }}</h1>
            <p class="sub">{{ MASJID.location }}</p>
          </div>
          <div class="ident-date">
            <p>{{ masehi }}</p>
            <p class="sub">{{ hijri }}</p>
          </div>
        </header>

        <div class="clock">
          <span class="clock-hm">{{ clock.hm }}</span><span class="clock-s">{{ clock.s }}</span>
        </div>

        <div class="pill glass">
          <PhSunHorizon class="gold" :size="20" />
          <span>Menjelang {{ next.name }}</span>
          <span class="pill-sep" />
          <span>± {{ remaining }} lagi</span>
        </div>

        <section class="glass prayers">
          <header class="card-head">
            <PhMosque class="gold" :size="22" />
            <h2>Jadwal Sholat</h2>
            <span class="loc"><PhMapPin :size="16" /> Bekasi</span>
          </header>
          <ul>
            <li v-for="(p, i) in PRAYER_TIMES" :key="p.name" class="prayer-row" :class="rowState(i)">
              <component :is="PRAYER_ICON[p.name]" :size="38" />
              <span class="p-name">{{ p.name }}</span>
              <span class="p-time">{{ p.time }}</span>
              <span class="p-status">
                <template v-if="rowState(i) === 'passed'">
                  <PhCheck :size="22" class="check" />
                  <span>Telah Berlalu</span>
                </template>
                <template v-else>
                  <PhClock :size="22" />
                  <span>{{ rowRemaining(p) }}</span>
                </template>
              </span>
            </li>
          </ul>
        </section>

        <section class="glass kajian">
          <PhBookOpen class="gold" :size="40" />
          <div>
            <h2>Kajian Rutin</h2>
            <p>{{ KAJIAN.schedule }}</p>
            <p>{{ KAJIAN.title }}</p>
          </div>
        </section>
      </aside>

      <!-- Panel kanan -->
      <main class="right">
        <div class="row top">
          <section class="card qris">
            <p class="qris-logo">QRIS</p>
            <p class="caption">Scan untuk Infaq, Sedekah, Wakaf, Zakat dan donasi lainnya</p>
            <svg class="qr-slot" :viewBox="`0 0 ${QR_N} ${QR_N}`" shape-rendering="crispEdges" role="img" aria-label="QR dummy">
              <rect :width="QR_N" :height="QR_N" fill="#fff" />
              <rect v-for="c in qrCells" :key="`${c.x}-${c.y}`" :x="c.x" :y="c.y" width="1" height="1" fill="#12332c" />
              <template v-for="f in QR_FINDERS" :key="`${f.x}-${f.y}`">
                <rect :x="f.x" :y="f.y" width="7" height="7" fill="#12332c" />
                <rect :x="f.x + 1" :y="f.y + 1" width="5" height="5" fill="#fff" />
                <rect :x="f.x + 2" :y="f.y + 2" width="3" height="3" fill="#12332c" />
              </template>
            </svg>
            <p class="qris-name">{{ MASJID.name }}</p>
            <p class="qris-nmid">NMID : {{ QRIS.nmid }}</p>
            <div class="account">
              <img src="/bsi.webp" alt="Bank Syariah Indonesia" class="bank-logo" />
              <div>
                <p class="acc-bank">{{ QRIS.bank }}</p>
                <p class="acc-no">{{ QRIS.account }}</p>
                <p class="acc-holder">{{ QRIS.holder }}</p>
              </div>
            </div>
          </section>

          <section class="card money">
            <header class="money-head">
              <PhWallet class="green" :size="24" />
              <h2>Total Keuangan Masjid</h2>
              <div ref="periodWrap" class="period">
                <button
                  type="button"
                  class="period-btn"
                  aria-haspopup="dialog"
                  :aria-expanded="pickerOpen"
                  @click="togglePicker"
                >
                  {{ periodLabel }} <PhCaretDown :size="12" />
                </button>
                <div v-if="pickerOpen" class="picker" role="dialog" aria-label="Pilih periode">
                  <div class="picker-year">
                    <button type="button" aria-label="Tahun sebelumnya" @click="pickerYear--"><PhCaretLeft :size="14" /></button>
                    <strong>{{ pickerYear }}</strong>
                    <button type="button" aria-label="Tahun berikutnya" @click="pickerYear++"><PhCaretRight :size="14" /></button>
                  </div>
                  <div class="picker-grid">
                    <button
                      v-for="(m, i) in MONTHS"
                      :key="m"
                      type="button"
                      :class="{ on: i === period.month && pickerYear === period.year }"
                      @click="pickPeriod(i)"
                    >
                      {{ m.slice(0, 3) }}
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <div class="total">
              <div class="total-head">
                <span>Total Pemasukan</span>
              </div>
              <p class="total-amount">{{ rp(totals.total) }}</p>
            </div>

            <div class="swap">
              <Transition name="swap" mode="out-in">
                <div v-if="!notice" key="tiles" class="tiles">
                  <button
                    v-for="c in DONATION.categories"
                    :key="c.key"
                    type="button"
                    class="tile"
                    @click="openDonate(c.key)"
                  >
                    <component :is="CAT_ICON[c.key]" :size="26" />
                    <div>
                      <p class="tile-label">{{ c.label }}</p>
                      <p class="tile-amount">{{ rp(totals.cats[c.key]) }}</p>
                    </div>
                  </button>
                </div>

                <div v-else :key="notice.id" class="notice-card" role="status" aria-live="polite">
                  <div class="notice-top">
                    <span class="notice-badge">Pembayaran masuk</span>
                    <span class="notice-count">{{ noticeLeft }}s</span>
                  </div>
                  <p class="notice-amount">{{ rp(notice.jumlah) }}</p>
                  <div class="notice-meta">
                    <span class="notice-name">{{ notice.nama }}</span>
                    <span class="notice-type">{{ notice.tipe }}</span>
                  </div>
                  <div class="notice-bar"><span /></div>
                </div>
              </Transition>
            </div>
          </section>

          <section class="card qurban">
            <header class="card-head">
              <PhCow class="cow" :size="26" />
              <h2>Program Qurban</h2>
              <span class="badge">{{ QURBAN.badge }}</span>
            </header>
            <p class="muted">{{ QURBAN.description }}</p>
            <div ref="qurbanLottie" class="qurban-lottie" aria-hidden="true"></div>
            <div class="progress-row">
              <div class="track">
                <div class="fill" :style="{ width: barReady ? `${qurbanPct}%` : '0%' }" />
              </div>
              <strong>{{ qurbanPct }}%</strong>
            </div>
            <p class="nominal">
              <strong>{{ rp(QURBAN.collected) }}</strong> dari {{ rp(QURBAN.target) }}
            </p>
          </section>
        </div>

        <div class="row mid">
          <section class="card verse">
            <header class="card-head">
              <PhBookOpen class="gold" :size="20" />
              <h2>Ayat Hari Ini</h2>
            </header>
            <p class="arab" dir="rtl" lang="ar">{{ VERSE.arab }}</p>
            <p class="terjemah">“{{ VERSE.translation }}”</p>
            <p class="ref">({{ VERSE.ref }})</p>
          </section>
        </div>

        <div class="row bottom">
          <section class="card articles">
            <header class="card-head">
              <PhBooks class="green" :size="20" />
              <h2>Artikel &amp; Kajian Islami</h2>
            </header>
            <div class="article-viewport">
              <ul class="article-track">
                <li
                  v-for="(a, i) in slides"
                  :key="i"
                  class="article"
                  :aria-hidden="i >= ARTICLES.length ? 'true' : null"
                  :style="a.image ? { backgroundImage: `url(${a.image})` } : null"
                >
                  <div class="article-overlay">
                    <span class="cat">{{ a.badge }}</span>
                    <h3>{{ a.title }}</h3>
                    <p class="date"><PhCalendarBlank :size="13" /> {{ a.date }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section class="card gallery">
            <header class="card-head">
              <PhImages class="green" :size="20" />
              <h2>Galeri Kegiatan</h2>
            </header>
            <div class="gallery-viewport">
              <ul class="gallery-track">
                <li
                  v-for="(g, i) in gallerySlides"
                  :key="i"
                  class="gallery-item-wrap"
                  :aria-hidden="i >= GALLERY.length ? 'true' : null"
                >
                  <button
                    type="button"
                    class="gallery-item"
                    :aria-label="`Lihat foto ${g.caption}`"
                    @click="openPhoto(g)"
                  >
                    <img :src="g.src" :alt="g.caption" loading="lazy" />
                    <span class="gallery-caption">
                      <span class="gallery-caption-title">{{ g.caption }}</span>
                      <span class="gallery-caption-date"><PhCalendarBlank :size="11" /> {{ g.date }}</span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <!-- Bar pengumuman -->
      <footer class="ticker">
        <div class="ticker-label">
          <PhSpeakerHigh class="gold" :size="22" />
          <span>Pengumuman</span>
        </div>
        <div class="ticker-viewport">
          <div class="ticker-track">
            <span>{{ tickerText }}</span>
            <span aria-hidden="true">{{ tickerText }}</span>
          </div>
        </div>
      </footer>

      <!-- Lightbox galeri -->
      <div v-if="activePhoto" class="modal-wrap lightbox-wrap" @click.self="closePhoto">
        <div class="card lightbox" role="dialog" aria-modal="true" aria-label="Foto kegiatan">
          <button type="button" class="lightbox-close" aria-label="Tutup" @click="closePhoto"><PhX :size="20" /></button>
          <img :src="activePhoto.src" :alt="activePhoto.caption" />
          <p class="lightbox-caption">{{ activePhoto.caption }} <span class="lightbox-date">— {{ activePhoto.date }}</span></p>
        </div>
      </div>

      <!-- Form donasi (simulasi) -->
      <div v-if="donateCat" class="modal-wrap" @click.self="closeDonate">
        <form class="card modal" role="dialog" aria-modal="true" aria-label="Form donasi" @submit.prevent="submitDonate">
          <header class="card-head">
            <component :is="CAT_ICON[donateCat]" class="green" :size="24" />
            <h2>Donasi {{ catLabel(donateCat) }}</h2>
          </header>
          <label class="field">
            Nama
            <input v-model="donateForm.nama" type="text" maxlength="40" placeholder="Hamba Allah" />
          </label>
          <div class="presets">
            <button
              v-for="p in DONATE_PRESETS"
              :key="p"
              type="button"
              :class="{ on: donateForm.jumlah === p }"
              @click="donateForm.jumlah = p"
            >
              {{ rp(p) }}
            </button>
          </div>
          <label class="field">
            Jumlah (Rp)
            <input v-model.number="donateForm.jumlah" type="number" min="1000" step="1000" />
          </label>
          <div class="modal-actions">
            <button type="button" class="ghost" @click="closeDonate">Batal</button>
            <button type="submit" class="primary" :disabled="!jumlahValid">Bayar (simulasi)</button>
          </div>
        </form>
      </div>

    </div>

    <!-- Layar live: menggantikan seluruh tampilan selama 20 menit sejak masuk waktu sholat -->
    <Transition name="live">
      <div v-if="live" class="live">
        <iframe
          class="live-frame"
          :src="LIVE_EMBED"
          title="Live streaming YouTube"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
        />
        <span class="live-badge"><span class="live-dot" /> LIVE</span>
        <div class="live-clock">
          <p class="live-time">{{ liveTime }}</p>
          <p class="live-prayer">
            <component :is="livePrayerIcon" v-if="livePrayerIcon" class="gold" :size="18" />
            {{ livePrayerLabel }}
          </p>
          <p class="live-date">{{ liveDate }}</p>
          <p class="live-hijri">{{ liveHijri }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Kanvas 1672x941, di-scale ke viewport. Semua ukuran px mengacu ke kanvas ini. */
.viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #0a2e2a;
}
.stage {
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  grid-template-columns: 680px 1fr;
  grid-template-rows: 1fr 44px;
  font-family: 'Plus Bekasi Sans', Poppins, Inter, sans-serif;
  color: #fff;
  transform-origin: 0 0;
}
.gold { color: #e3a94a; flex: none; }
.green { color: #0d3b33; flex: none; }
.cow { color: #0d3b33; flex: none; }
.muted { color: #6b7f78; font-size: 12px; }
.sub { opacity: 0.85; font-size: 14px; }
p { margin: 0; }
h1, h2, h3 { margin: 0; }

.glass {
  background: rgba(8, 40, 34, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  border-radius: 18px;
}
.card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(20, 60, 50, 0.08);
  color: #12332c;
  min-width: 0;
  min-height: 0;
}
.card-head { display: flex; align-items: center; gap: 8px; }
.card-head h2 { font-size: 18px; font-weight: 700; }

/* ---------- Panel kiri ---------- */
.left {
  grid-column: 1;
  grid-row: 1;
  min-height: 0;
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background:
    linear-gradient(180deg, rgba(10, 46, 42, 0.55) 0%, rgba(10, 46, 42, 0.35) 35%, rgba(10, 46, 42, 0.92) 65%, #0a2e2a 100%),
    url('/masjid.webp') center / cover no-repeat;
}
.ident { display: flex; align-items: center; gap: 12px; }
.ident h1 { font-size: 20px; font-weight: 700; line-height: 1.2; }
.ident-date { margin-left: auto; text-align: right; font-size: 15px; line-height: 1.4; }
.ident-date .sub { font-size: 16px; }

.clock {
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  margin-top: 8px;
}
.clock-hm { font-size: 88px; letter-spacing: -2px; }
.clock-s { font-size: 56px; }

.pill {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 13px;
  white-space: nowrap;
  box-shadow: none;
}
.pill-sep { width: 1px; height: 16px; background: rgba(255, 255, 255, 0.3); margin: 0 2px; }

.prayers { flex: 1; min-height: 0; padding: 14px 16px; display: flex; flex-direction: column; }
.card-head .loc { margin-left: auto; display: flex; align-items: center; gap: 4px; font-size: 13px; }
.prayers ul { list-style: none; margin: 10px 0 0; padding: 0; flex: 1; min-height: 0; display: grid; grid-template-rows: repeat(5, 1fr); gap: 6px; }
.prayer-row {
  display: grid;
  grid-template-columns: 44px 1fr 100px 220px;
  align-items: center;
  gap: 8px;
  padding: 2px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.07);
  transition: background-color 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.prayer-row.active { background: #2e9e62; font-weight: 600; }
.prayer-row.passed { color: rgba(255, 255, 255, 0.75); }
.p-name { font-size: 26px; font-weight: 700; }
.p-time { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; }
.p-status { display: flex; align-items: center; gap: 6px; font-size: 20px; white-space: nowrap; }
.p-status .check { color: #8fe0b0; }

.kajian {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
}
.kajian h2 { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
.kajian p { font-size: 13px; line-height: 1.35; }

/* ---------- Panel kanan ---------- */
.right {
  grid-column: 2;
  grid-row: 1;
  min-height: 0;
  padding: 14px;
  display: grid;
  grid-template-rows: auto 170px minmax(0, 1fr);
  gap: 12px;
  background: #faf7f0;
}
.row { display: grid; gap: 12px; min-height: 0; }
.row.top { grid-template-columns: 340px minmax(0, 1fr) 420px; }
.row.mid { grid-template-columns: 1fr; }
.row.bottom { grid-template-columns: 1fr 1fr; gap: 12px; align-items: stretch; }

/* QRIS */
.qris {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.qris-logo { font-size: 24px; font-weight: 800; letter-spacing: 1px; }
.caption { font-size: 13px; color: #3f5a52; margin-top: 4px; line-height: 1.4; }
.qr-slot {
  margin: 10px 0 8px;
  width: 130px;
  height: 130px;
  border-radius: 8px;
}
.qris-name { font-size: 16px; font-weight: 700; }
.qris-nmid { font-size: 13px; color: #6b7f78; }
.account {
  margin-top: auto;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #eef3ef;
  border-radius: 14px;
  text-align: left;
}
.bank-logo { width: 56px; height: auto; flex: none; object-fit: contain; }
.acc-bank { font-size: 13px; font-weight: 700; }
.acc-no { font-size: 24px; font-weight: 800; line-height: 1.2; }
.acc-holder { font-size: 13px; }

/* Keuangan */
.money {
  position: relative;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.money-head { display: flex; align-items: center; gap: 10px; }
.money-head h2 { font-size: 19px; font-weight: 700; }
.period { margin-left: auto; position: relative; }
.period-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #12332c;
  background: #f1f1ee;
  border: 0;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
  white-space: nowrap;
}
.period-btn:hover { background: #e6efe9; }
.period-btn:focus-visible { outline: 2px solid #2e9e62; outline-offset: 2px; }
.picker {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 10;
  width: 230px;
  padding: 10px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(20, 60, 50, 0.18);
}
.picker-year {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}
.picker-year button {
  display: grid;
  place-items: center;
  padding: 4px;
  border: 0;
  border-radius: 8px;
  background: none;
  color: #12332c;
  cursor: pointer;
}
.picker-year button:hover { background: #f1f1ee; }
.picker-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.picker-grid button {
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 7px 0;
  border: 0;
  border-radius: 10px;
  background: #f1f1ee;
  color: #12332c;
  cursor: pointer;
}
.picker-grid button:not(.on):hover { background: #ddf2e6; }
.picker-grid button.on { background: #0f4a3e; color: #fff; }
.total {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: linear-gradient(90deg, #0f4a3e 0%, #136152 100%);
  border-radius: 14px;
  padding: 12px 16px;
  color: #fff;
}
.total-head { display: flex; align-items: center; gap: 6px; font-size: 14px; opacity: 0.85; }
.total-amount { font-size: 28px; font-weight: 800; line-height: 1.1; font-variant-numeric: tabular-nums; }
.tiles { display: grid; grid-template-columns: 1fr; }
.tile {
  font: inherit;
  color: inherit;
  text-align: left;
  background: none;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 8px 4px;
  min-width: 0;
}
.tile + .tile { border-top: 1px solid #e6efe9; }
.tile:focus-visible { outline: 2px solid #2e9e62; outline-offset: 2px; }
.tile > div { min-width: 0; }
.tile-label { font-size: 16px; font-weight: 700; }
.tile-amount { font-size: 15px; font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* Ayat */
.verse {
  padding: 14px 18px;
  background: linear-gradient(90deg, #0f4a3e 0%, #0d3b33 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.verse .card-head h2 { color: #fff; }
.arab {
  font-family: 'Amiri', serif;
  font-size: 26px;
  line-height: 1.4;
  text-align: right;
}
.terjemah { font-size: 16px; line-height: 1.4; }
.ref { font-size: 13px; opacity: 0.8; }

/* Qurban */
.qurban {
  padding: 14px 18px 10px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}
.qurban-lottie {
  width: calc(100% + 36px);
  margin-top: auto;
  margin-left: -18px;
  margin-right: -18px;
  margin-bottom: 0;
  height: 220px;
  max-height: none;
  aspect-ratio: auto;
  flex: none;
  background: transparent;
  border: 0;
  overflow: hidden;
  align-self: stretch;
}
.qurban-lottie svg {
  width: 100% !important;
  height: 100% !important;
  display: block;
  object-fit: contain;
  transform: scale(1.35);
  transform-origin: center center;
}
.badge {
  margin-left: auto;
  background: #f0a04b;
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  white-space: nowrap;
}
.qurban .muted { font-size: 14px; }
.progress-row { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.track { flex: 1; height: 10px; border-radius: 999px; background: #e6efe9; overflow: hidden; }
.fill {
  height: 100%;
  border-radius: 999px;
  background: #2e9e62;
  transition: width 900ms cubic-bezier(0.23, 1, 0.32, 1);
}
.progress-row strong { font-size: 14px; }
.nominal { font-size: 14px; color: #6b7f78; margin-top: 2px; }
.nominal strong { color: #12332c; }

/* Artikel */
.articles {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}
.article-viewport { flex: 1; min-height: 0; overflow: hidden; }
.article-track {
  list-style: none;
  margin: 0;
  padding: 0;
  width: max-content;
  height: 100%;
  display: flex;
  gap: 10px;
  animation: slide 40s linear infinite; /* ponytail: durasi tetap. Hitung dari jumlah slide saat data dinamis. */
}
.article-viewport:hover .article-track { animation-play-state: paused; }
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.article {
  position: relative;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  overflow: hidden;
  min-width: 0;
  display: flex;
  align-items: flex-end;
  flex: none;
  background-color: #12332c;
  background-size: cover;
  background-position: center;
  /* Tinggi = sisa ruang card, lebar ikut rasio 3/2 supaya sejajar dengan galeri. */
  width: auto;
  height: 100%;
  aspect-ratio: 3 / 2;
}
/* gradient hitam tipis di bawah agar teks terbaca */
.article::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 42%, rgba(0,0,0,0.08) 72%, transparent 100%);
  pointer-events: none;
}
.article-overlay {
  position: relative;
  z-index: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}
.cat {
  align-self: flex-start;
  background: #14705a;
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 2px 8px;
}
.article h3 {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  color: #fff;
  text-shadow: 0 1px 8px rgba(0,0,0,0.55);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.article .date {
  font-size: 12px;
  color: rgba(255,255,255,0.82);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Galeri kegiatan — di kanan artikel, satu baris looping kayak artikel, ukuran sama */
.gallery {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}
.gallery-viewport { flex: 1; min-height: 0; overflow: hidden; }
.gallery-track {
  list-style: none;
  margin: 0;
  padding: 0;
  width: max-content;
  height: 100%;
  display: flex;
  gap: 10px;
  animation: gallery-slide 28s linear infinite;
}
.gallery-viewport:hover .gallery-track { animation-play-state: paused; }
.gallery-item-wrap { flex: none; height: 100%; list-style: none; }
@keyframes gallery-slide {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.gallery-item {
  position: relative;
  border: 0;
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #e6efe9;
  display: block;
  /* Sama seperti kartu artikel: tinggi mengisi card, lebar ikut rasio 3/2. */
  height: 100%;
  width: auto;
  aspect-ratio: 3 / 2;
}
.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.gallery-item:hover img { transform: scale(1.04); }
.gallery-item:focus-visible { outline: 2px solid #2e9e62; outline-offset: 2px; }
.gallery-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 22px 10px 8px;
  background: linear-gradient(to top, rgba(0,0,0,0.72), transparent);
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
  text-shadow: 0 1px 6px rgba(0,0,0,0.55);
  overflow: hidden;
}
.gallery-caption-title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gallery-caption-date {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.88;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.lightbox-date { font-weight: 500; opacity: 0.75; }

/* ---------- Bar pengumuman ---------- */
.ticker {
  grid-column: 1 / -1;
  grid-row: 2;
  background: #0a2e2a;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.ticker-label {
  flex: none;
  width: 200px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 26px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 15px;
  font-weight: 700;
}
.ticker-viewport { flex: 1; overflow: hidden; padding-left: 20px; }
.ticker-track {
  display: inline-flex;
  white-space: nowrap;
  font-size: 13px;
  animation: marquee 45s linear infinite; /* ponytail: durasi tetap, bukan dihitung dari lebar teks. */
}
.ticker-track span { padding-right: 48px; }
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

/* ---------- Layar live saat waktu sholat ---------- */
.live {
  position: absolute;
  inset: 0;
  z-index: 100;
  background: #000;
}
.live-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
/* Penanda live, menggantikan label YouTube di frame */
.live-badge {
  position: absolute;
  top: 24px;
  left: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-family: 'Plus Bekasi Sans', Poppins, Inter, sans-serif;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1.5px;
}
.live-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff3b30;
  animation: live-pulse 1.4s ease-in-out infinite;
}
@keyframes live-pulse {
  50% { opacity: 0.3; }
}
.live-clock {
  position: absolute;
  right: 28px;
  bottom: 28px;
  min-width: 320px;
  padding: 16px 26px;
  border-radius: 18px;
  background: rgba(8, 40, 34, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  color: #fff;
  text-align: center;
  font-family: 'Plus Bekasi Sans', Poppins, Inter, sans-serif;
}
.live-time {
  font-size: 56px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
}
.live-prayer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 10px auto 0;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}
.live-date { font-size: 17px; margin-top: 10px; }
.live-hijri { font-size: 15px; opacity: 0.85; }

/* Transisi masuk/keluar layar live: tumpang tindih fade + zoom video, kartu menyusul */
.live-enter-active { transition: opacity 500ms cubic-bezier(0.23, 1, 0.32, 1); }
.live-leave-active { transition: opacity 450ms cubic-bezier(0.4, 0, 1, 1); }
.live-enter-from, .live-leave-to { opacity: 0; }
.live-enter-active .live-frame { animation: live-zoom 900ms cubic-bezier(0.23, 1, 0.32, 1) both; }
@keyframes live-zoom {
  from { transform: scale(1.06); }
  to { transform: scale(1); }
}
.live-enter-active .live-clock { animation: live-rise 520ms 200ms cubic-bezier(0.23, 1, 0.32, 1) both; }
.live-enter-active .live-badge { animation: live-in 400ms 420ms ease both; }
.live-leave-active .live-clock, .live-leave-active .live-badge { animation: live-out 200ms ease both; }
@keyframes live-rise {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes live-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes live-out {
  to { opacity: 0; transform: translateY(6px); }
}

/* Lightbox galeri */
.lightbox-wrap { cursor: pointer; }
.lightbox {
  position: relative;
  width: min(560px, 86vw);
  max-height: 78vh;
  padding: 0;
  overflow: hidden;
  cursor: default;
}
.lightbox img {
  width: 100%;
  max-height: 62vh;
  object-fit: cover;
  display: block;
}
.lightbox-caption {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  color: #12332c;
  text-align: center;
}
.lightbox-close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  cursor: pointer;
}
.lightbox-close:hover { background: rgba(0,0,0,0.72); }
.lightbox-close:focus-visible { outline: 2px solid #2e9e62; outline-offset: 2px; }

/* ---------- Donasi (simulasi) ---------- */
.modal-wrap {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(5, 25, 22, 0.55);
}
.modal { width: 420px; padding: 22px; display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 600; }
.field input {
  font: inherit;
  font-size: 16px;
  font-weight: 500;
  padding: 10px 12px;
  border: 1px solid #cfd9d4;
  border-radius: 10px;
  color: #12332c;
}
.presets { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.presets button {
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 10px;
  border: 0;
  border-radius: 10px;
  background: #f1f1ee;
  color: #12332c;
  cursor: pointer;
}
.presets button.on { background: #0f4a3e; color: #fff; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.modal-actions button {
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 16px;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
}
.modal-actions .ghost { background: #f1f1ee; color: #12332c; }
.modal-actions .primary { background: #0f4a3e; color: #fff; }
.modal-actions .primary:disabled { opacity: 0.5; cursor: not-allowed; }
/* Area tile kategori: bergantian dengan card notifikasi pembayaran */
.swap { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.swap > * { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.notice-card {
  justify-content: center;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(20, 60, 50, 0.12);
}
.notice-top { display: flex; align-items: center; justify-content: space-between; }
.notice-badge { background: #14705a; color: #fff; border-radius: 999px; padding: 4px 12px; font-size: 14px; font-weight: 700; }
.notice-count { font-size: 18px; font-weight: 800; color: #0f4a3e; font-variant-numeric: tabular-nums; }
.notice-amount { font-size: 36px; font-weight: 800; line-height: 1.1; color: #0d3b33; font-variant-numeric: tabular-nums; }
.notice-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.notice-name { background: #ddf2e6; color: #0d3b33; border-radius: 999px; padding: 4px 12px; font-size: 15px; font-weight: 700; }
.notice-type { border: 2px solid #2e9e62; border-radius: 999px; padding: 2px 12px; font-size: 15px; font-weight: 600; }
.notice-bar { height: 6px; border-radius: 999px; background: #e6efe9; overflow: hidden; }
.notice-bar span {
  display: block;
  height: 100%;
  background: #2e9e62;
  transform-origin: left;
  animation: drain 4s linear forwards; /* durasi sinkron dengan NOTICE_MS */
}
@keyframes drain {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.swap-enter-active, .swap-leave-active {
  transition: opacity 400ms cubic-bezier(0.23, 1, 0.32, 1), transform 400ms cubic-bezier(0.23, 1, 0.32, 1);
}
.swap-enter-from { opacity: 0; transform: translateY(16px) scale(0.98); }
.swap-leave-to { opacity: 0; transform: translateY(-16px) scale(0.98); }

@media (prefers-reduced-motion: reduce) {
  .ticker-track, .gallery-track, .article-track { animation-play-state: paused; }
  .fill, .prayer-row, .swap-enter-active, .swap-leave-active { transition: none; }
  .live-dot { animation: none; }
  .live-enter-active, .live-leave-active { transition: none; }
  .live-enter-active .live-frame, .live-enter-active .live-clock,
  .live-enter-active .live-badge, .live-leave-active .live-clock,
  .live-leave-active .live-badge { animation: none; }
}
</style>
