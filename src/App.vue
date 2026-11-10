<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  PhAmbulance, PhBookOpen, PhCalendarDots, PhCaretLeft, PhCaretRight, PhClock,
  PhCoins, PhCow, PhHandHeart, PhImages, PhMapPin, PhMicrophone, PhMoney,
  PhMosque, PhPause, PhPlay, PhSpeakerHigh, PhUser, PhUsersThree,
} from '@phosphor-icons/vue';
import {
  BALANCES, FRIDAY_ROSTER, GALLERY, PROGRAMS, SECTION_TITLES, SITE, WEEKLY_SCHEDULE, dailyVerse,
} from './data.js';
import { readDashboardContent, dashboardImageUrl } from './lib/sanity.js';
import { WIB, jakartaDateKey } from './lib/time.js';

const asset = (name) => `${import.meta.env.BASE_URL}${name.replace(/^\/+/, '')}`;
const clockFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: WIB, hourCycle: 'h23', hour: '2-digit', minute: '2-digit',
});
const weekdayFormat = new Intl.DateTimeFormat('id-ID', { timeZone: WIB, weekday: 'long' });
const dateFormat = new Intl.DateTimeFormat('id-ID', {
  timeZone: WIB, day: 'numeric', month: 'long', year: 'numeric',
});
const rupiah = new Intl.NumberFormat('id-ID');
const formatAmount = (amount) => Number.isSafeInteger(amount) ? `Rp ${rupiah.format(amount)}` : 'Belum tersedia';

const now = ref(new Date());
const dateKey = computed(() => jakartaDateKey(now.value));
const weekday = computed(() => weekdayFormat.format(now.value));
const content = ref({});
const site = computed(() => content.value.site ?? SITE);
const schedule = computed(() => content.value.schedule);
const scheduleEntries = computed(() => schedule.value ? (schedule.value.entries ?? []) : WEEKLY_SCHEDULE);
const friday = computed(() => content.value.friday ?? FRIDAY_ROSTER);
const finances = computed(() => content.value.finances);
const balances = computed(() => finances.value ? (finances.value.balances ?? []) : BALANCES);
const programs = computed(() => content.value.programs ?? PROGRAMS);
const gallery = computed(() => content.value.gallery ?? GALLERY);
const photos = computed(() => gallery.value.photos ?? []);
const verses = computed(() => content.value.verses);
const localOverrides = ref({});
const verse = computed(() => {
  const overrides = verses.value
    ? Object.fromEntries((verses.value.dated ?? []).map((entry) => [entry.date, entry]))
    : localOverrides.value;
  return dailyVerse(dateKey.value, overrides, verses.value?.rotation);
});

const scheduleIcons = { book: PhBookOpen, group: PhUsersThree, mosque: PhMosque };
const fridayRoles = [
  { key: 'khatib', label: 'Khatib', icon: PhUser },
  { key: 'imam', label: 'Imam', icon: PhMicrophone },
  { key: 'muadzin', label: 'Muadzin', icon: PhSpeakerHigh },
  { key: 'bilal', label: 'Bilal', icon: PhUser },
];
const slideIcons = {
  ambulance: PhAmbulance, wakaf: PhMosque, qurban: PhCow, gallery: PhImages, carpet: PhCoins,
};
const slides = computed(() => Object.entries(slideIcons).map(([id, icon]) => ({
  ...(id === 'gallery' ? gallery.value : programs.value[id] ?? PROGRAMS[id]),
  id,
  icon,
})));

const activeIndex = ref(slides.value.findIndex(({ id }) => id === 'carpet'));
const slide = computed(() => slides.value[activeIndex.value]);
const photoIndex = ref(-1);
const photo = computed(() => photos.value[photoIndex.value] ?? photos.value[0]);
const failedImage = ref(null);
const image = computed(() => slide.value.id === 'gallery' ? photo.value?.image : slide.value.image);
const slideImage = computed(() => dashboardImageUrl(image.value, asset));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const paused = ref(reducedMotion.matches);
let rotationTimer;
let refreshTimer;
let clockTimer;
let contentRequest;
let verseRequest;

function rotatePhoto() {
  if (photos.value.length) photoIndex.value = (photoIndex.value + 1) % photos.value.length;
}

function selectSlide(index) {
  const nextIndex = (index + slides.value.length) % slides.value.length;
  if (slides.value[nextIndex].id === 'gallery' && nextIndex !== activeIndex.value) rotatePhoto();
  activeIndex.value = nextIndex;
  scheduleRotation();
}

function scheduleRotation() {
  clearTimeout(rotationTimer);
  if (!paused.value) rotationTimer = setTimeout(() => selectSlide(activeIndex.value + 1), 12_000);
}

function onCarouselKey(event) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  selectSlide(activeIndex.value + (event.key === 'ArrowRight' ? 1 : -1));
}

function pauseOnKeyboardFocus(event) {
  if (event.target.matches(':focus-visible')) paused.value = true;
}

function onMotionChange(event) {
  if (event.matches) paused.value = true;
}

async function loadVerseOverrides() {
  if (verses.value || verseRequest) return;
  const request = new AbortController();
  verseRequest = request;
  const timeout = setTimeout(() => request.abort(), 5_000);
  try {
    const response = await fetch(asset('ayat-hari-ini.json'), { cache: 'no-store', signal: request.signal });
    if (!response.ok) return;
    const entries = await response.json();
    if (entries && typeof entries === 'object' && !Array.isArray(entries)) localOverrides.value = entries;
  } catch {
    // Keep the last available verses if the TV temporarily loses its connection.
  } finally {
    clearTimeout(timeout);
    verseRequest = null;
  }
}

async function refreshContent() {
  if (contentRequest) return;
  const request = new AbortController();
  contentRequest = request;
  const timeout = setTimeout(() => request.abort(), 5_000);
  try {
    content.value = await readDashboardContent(request.signal);
  } catch {
    // Keep the last successful dashboard content when Sanity is unreachable.
  } finally {
    clearTimeout(timeout);
    contentRequest = null;
  }
}

function refreshDashboard() {
  refreshContent();
  loadVerseOverrides();
}

watch(paused, scheduleRotation);
watch(dateKey, loadVerseOverrides);
watch(() => site.value.pageTitle, (title) => { document.title = title; });
watch(slideImage, () => { failedImage.value = null; });
watch(photos, (items) => {
  if (!items.length) photoIndex.value = -1;
  else if (slide.value.id === 'gallery' && !items[photoIndex.value]) photoIndex.value = 0;
});

onMounted(() => {
  scheduleRotation();
  refreshDashboard();
  clockTimer = setInterval(() => (now.value = new Date()), 1000);
  refreshTimer = setInterval(refreshDashboard, 60_000);
  reducedMotion.addEventListener('change', onMotionChange);
});
onUnmounted(() => {
  clearTimeout(rotationTimer);
  clearInterval(clockTimer);
  clearInterval(refreshTimer);
  contentRequest?.abort();
  verseRequest?.abort();
  reducedMotion.removeEventListener('change', onMotionChange);
});
</script>

<template>
  <div class="dashboard">
    <header class="masthead">
      <div class="identity">
        <PhMosque class="identity-mark" weight="fill" aria-hidden="true" />
        <div>
          <h1>{{ site.heading }}</h1>
          <p><PhMapPin weight="fill" aria-hidden="true" /> {{ site.name }} · {{ site.location }}</p>
        </div>
      </div>
      <div class="date-time">
        <div class="today-date">
          <PhCalendarDots aria-hidden="true" />
          <time :datetime="dateKey"><strong>{{ weekday }},</strong> {{ dateFormat.format(now) }}</time>
        </div>
        <div class="today-clock">
          <PhClock aria-hidden="true" />
          <time :datetime="clockFormat.format(now)">{{ clockFormat.format(now) }}</time>
          <span>WIB</span>
        </div>
      </div>
    </header>

    <aside class="schedule" aria-labelledby="schedule-title">
      <header class="schedule-heading">
        <PhCalendarDots aria-hidden="true" />
        <div>
          <h2 id="schedule-title">{{ schedule?.title ?? SECTION_TITLES.schedule }}</h2>
          <p>{{ schedule?.subtitle ?? SECTION_TITLES.scheduleSubtitle }}</p>
        </div>
      </header>
      <ul v-if="scheduleEntries.length" class="schedule-list">
        <li v-for="entry in scheduleEntries" :key="entry._key ?? entry.day" class="schedule-row">
          <div class="schedule-day"><PhCalendarDots aria-hidden="true" /> <strong>{{ entry.day }}</strong></div>
          <div class="schedule-activity">
            <component :is="scheduleIcons[entry.kind] || PhBookOpen" aria-hidden="true" />
            <div><strong>{{ entry.title }}</strong><span v-if="entry.detail">{{ entry.detail }}</span></div>
          </div>
          <div class="schedule-time">
            <PhClock aria-hidden="true" />
            <div><strong>{{ entry.time }}</strong><span v-if="entry.duration">{{ entry.duration }}</span></div>
          </div>
        </li>
      </ul>
      <p v-else class="schedule-empty">Jadwal kajian belum tersedia.</p>
    </aside>

    <main class="main-content">
      <section
        class="carousel"
        aria-label="Informasi dan program masjid"
        aria-roledescription="karusel"
        @keydown="onCarouselKey"
        @focusin="pauseOnKeyboardFocus"
      >
        <div class="slide-frame" :aria-live="paused ? 'polite' : 'off'">
          <article :key="slide.id" class="slide" :class="`slide--${slide.id}`">
            <div class="slide-copy">
              <div class="slide-kicker">
                <component :is="slide.id === 'carpet' ? PhHandHeart : slide.icon" aria-hidden="true" />
                <span>{{ slide.category }}</span>
              </div>
              <h2>{{ slide.title }}</h2>
              <template v-if="slide.id === 'carpet'">
                <div class="donation-total">
                  <PhCoins aria-hidden="true" />
                  <div><p>{{ programs.donationLabel }}</p><strong>{{ formatAmount(programs.donationTotal) }}</strong></div>
                </div>
                <p v-if="slide.description" class="slide-description">{{ slide.description }}</p>
              </template>
              <template v-else-if="slide.id === 'gallery'">
                <p v-if="!photo" class="slide-description">Foto kegiatan belum tersedia.</p>
                <template v-else>
                  <p class="slide-description">{{ photo.caption }}</p>
                  <p v-if="photo.date" class="photo-date">{{ dateFormat.format(new Date(photo.date)) }}</p>
                  <p v-if="failedImage === slideImage" class="photo-date">Foto tidak dapat ditampilkan.</p>
                </template>
              </template>
              <p v-else class="slide-description">{{ slide.description }}</p>
            </div>
            <div class="slide-visual" :class="{ 'slide-visual--photo': slideImage && failedImage !== slideImage }">
              <img
                v-if="slideImage && failedImage !== slideImage"
                :key="slideImage"
                :src="slideImage"
                :alt="image?.alt || (slide.id === 'gallery' ? photo.caption : '')"
                @error="failedImage = slideImage"
              />
              <component :is="slide.icon" v-else class="slide-emblem" weight="duotone" aria-hidden="true" />
            </div>
          </article>
          <button class="slide-arrow slide-arrow--prev" type="button" aria-label="Slide sebelumnya" @click="selectSlide(activeIndex - 1)">
            <PhCaretLeft weight="bold" aria-hidden="true" />
          </button>
          <button class="slide-arrow slide-arrow--next" type="button" aria-label="Slide berikutnya" @click="selectSlide(activeIndex + 1)">
            <PhCaretRight weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div class="slide-menu" role="group" aria-label="Pilih slide">
          <button
            v-for="(item, index) in slides"
            :key="item.id"
            class="slide-tab"
            type="button"
            :aria-pressed="activeIndex === index"
            @click="selectSlide(index)"
          >
            <component :is="item.icon" weight="duotone" aria-hidden="true" />
            <span><strong>{{ item.label }}</strong><small v-if="item.note">{{ item.note }}</small></span>
          </button>
        </div>
        <div class="carousel-status">
          <span class="slide-dots" :aria-label="`Slide ${activeIndex + 1} dari ${slides.length}`" role="img">
            <span v-for="(_, index) in slides" :key="index" :class="{ current: activeIndex === index }"></span>
          </span>
          <button
            v-if="slide.id === 'gallery' && photos.length > 1"
            class="photo-next"
            type="button"
            @click="rotatePhoto(); scheduleRotation()"
          >
            Foto berikutnya <PhCaretRight aria-hidden="true" />
          </button>
          <button class="rotation-button" type="button" :aria-label="paused ? 'Putar slide otomatis' : 'Jeda slide otomatis'" @click="paused = !paused">
            <PhPlay v-if="paused" weight="fill" aria-hidden="true" />
            <PhPause v-else weight="fill" aria-hidden="true" />
          </button>
        </div>
      </section>

      <div class="info-panels">
        <section class="info-panel friday" aria-labelledby="friday-title">
          <header class="panel-heading"><PhMosque weight="fill" aria-hidden="true" /><h2 id="friday-title">{{ friday.title ?? SECTION_TITLES.friday }}</h2></header>
          <dl class="panel-list">
            <div v-for="role in fridayRoles" :key="role.key" class="panel-row">
              <dt><component :is="role.icon" weight="duotone" aria-hidden="true" /> {{ role.label }}</dt>
              <dd>{{ friday[role.key] || 'Belum ditetapkan' }}</dd>
            </div>
          </dl>
        </section>

        <section class="info-panel verse" aria-labelledby="verse-title">
          <header class="panel-heading"><PhBookOpen aria-hidden="true" /><h2 id="verse-title">{{ verses?.title ?? SECTION_TITLES.verses }}</h2></header>
          <figure class="verse-body">
            <blockquote :cite="verse.source">
              <p class="verse-arabic" dir="rtl" lang="ar">{{ verse.arab }}</p>
              <span class="verse-rule" aria-hidden="true"><i></i></span>
              <p class="verse-translation">“{{ verse.translation }}”</p>
            </blockquote>
            <figcaption>{{ verse.ref }}</figcaption>
          </figure>
        </section>

        <section class="info-panel finances" aria-labelledby="finances-title">
          <header class="panel-heading"><PhCoins aria-hidden="true" /><h2 id="finances-title">{{ finances?.title ?? SECTION_TITLES.finances }}</h2></header>
          <dl class="panel-list">
            <div v-for="balance in balances" :key="balance._key ?? balance.label" class="panel-row">
              <dt>
                <PhMoney weight="duotone" aria-hidden="true" />
                <span>{{ balance.label }}<small v-if="balance.detail">{{ balance.detail }}</small></span>
              </dt>
              <dd>{{ formatAmount(balance.amount) }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>

    <footer class="footer">
      <PhMosque weight="fill" aria-hidden="true" />
      <p>{{ site.footer }}</p>
      <span v-if="site.sampleData ?? SITE.sampleData" class="sample-label">{{ site.sampleLabel }}</span>
    </footer>
  </div>
</template>

<style src="./dashboard.css"></style>
