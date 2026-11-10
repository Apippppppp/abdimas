import assert from 'node:assert/strict';
import { DAILY_VERSES, dailyVerse } from '../data.js';
import { jakartaDateKey } from './time.js';

const beforeMidnight = jakartaDateKey(new Date('2026-11-09T16:59:59Z'));
const afterMidnight = jakartaDateKey(new Date('2026-11-09T17:00:00Z'));
assert.equal(beforeMidnight, '2026-11-09');
assert.equal(afterMidnight, '2026-11-10');

const customVerse = { ...DAILY_VERSES[0] };
const overrides = { [afterMidnight]: customVerse };
assert.equal(dailyVerse(afterMidnight, overrides), customVerse);
assert.ok(DAILY_VERSES.includes(dailyVerse(beforeMidnight, overrides)));
assert.notEqual(dailyVerse(beforeMidnight, {}), dailyVerse(afterMidnight, {}));
assert.equal(dailyVerse(afterMidnight, { [afterMidnight]: { arab: ' ' } }), dailyVerse(afterMidnight, {}));

console.log('WIB date rollover and daily verse: ok');
