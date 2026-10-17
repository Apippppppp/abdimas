import assert from 'node:assert/strict';
import { secondsUntil, nextPrayerIndex, formatRemaining } from './time.js';

const TIMES = [
  { name: 'Subuh', time: '04:28' },
  { name: 'Dzuhur', time: '11:53' },
  { name: 'Ashar', time: '15:10' },
  { name: 'Maghrib', time: '17:47' },
  { name: 'Isya', time: '19:01' },
];
const at = (h, m, s = 0) => new Date(2026, 9, 15, h, m, s);

// 13:45:27 -> Ashar 15:10 = 1 jam 24 menit 33 detik, dibulatkan ke atas = 1 jam 25 menit
assert.equal(nextPrayerIndex(TIMES, at(13, 45, 27)), 2);
assert.equal(formatRemaining(secondsUntil('15:10', at(13, 45, 27))), '1 jam 25 menit');

// Setelah Isya, sholat berikutnya Subuh besok
assert.equal(nextPrayerIndex(TIMES, at(23, 0)), 0);
assert.equal(formatRemaining(secondsUntil('04:28', at(23, 0))), '5 jam 28 menit');

assert.equal(formatRemaining(300), '5 menit');
assert.equal(formatRemaining(0), '0 menit');

console.log('time.test: ok');
