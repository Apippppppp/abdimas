import console from 'node:console'
import process from 'node:process'
import {URL} from 'node:url'
import {readFile} from 'node:fs/promises'
import {basename} from 'node:path'
import {getCliClient} from 'sanity/cli'
import {
  BALANCES,
  DAILY_VERSES,
  FRIDAY_ROSTER,
  GALLERY,
  PROGRAMS,
  SECTION_TITLES,
  SITE,
  WEEKLY_SCHEDULE,
} from '../../../src/data.js'
import {apiVersion, dashboardQuery} from '../content.mjs'

const publicFile = (path) => new URL(`../../../public/${path}`, import.meta.url)
const keyed = (type, items) =>
  items.map((item, index) => ({...item, _type: type, _key: `${type}-${index + 1}`}))
const singleton = (name, fields) => ({_id: name, _type: name, ...fields})

async function seed() {
  const dated = JSON.parse(await readFile(publicFile('ayat-hari-ini.json'), 'utf8'))
  const {donationLabel, donationTotal, ...programs} = PROGRAMS
  const documents = [
    singleton('siteSettings', SITE),
    singleton('weeklySchedule', {
      title: SECTION_TITLES.schedule,
      subtitle: SECTION_TITLES.scheduleSubtitle,
      entries: keyed('activity', WEEKLY_SCHEDULE),
    }),
    singleton('fridayRoster', {title: SECTION_TITLES.friday, ...FRIDAY_ROSTER}),
    singleton('finances', {
      title: SECTION_TITLES.finances,
      balances: keyed('balance', BALANCES),
    }),
    singleton('programs', {
      donationLabel,
      donationTotal,
      ...Object.fromEntries(
        Object.entries(programs).map(([key, program]) => [key, {...program, _type: 'program'}]),
      ),
    }),
    singleton('gallery', {...GALLERY, photos: keyed('photo', GALLERY.photos)}),
    singleton('dailyVerses', {
      title: SECTION_TITLES.verses,
      rotation: keyed('verse', DAILY_VERSES),
      dated: keyed('datedVerse', Object.entries(dated).map(([date, verse]) => ({date, ...verse}))),
    }),
  ]

  const assetSources = [...Object.values(programs), ...GALLERY.photos]
    .map((entry) => entry.image?.src)
    .filter(Boolean)
  const assets = new Map(await Promise.all(
    [...new Set(assetSources)].map(async (src) => [src, await readFile(publicFile(src))]),
  ))

  console.log(`Sumber: ${documents.length} dokumen, ${WEEKLY_SCHEDULE.length} kegiatan, ${BALANCES.length} saldo, ${DAILY_VERSES.length} ayat rotasi, ${Object.keys(dated).length} ayat bertanggal, ${assets.size} aset foto.`)
  if (!process.argv.includes('--apply')) return

  const client = getCliClient({apiVersion}).withConfig({useCdn: false, perspective: 'raw'})
  const ids = documents.map(({_id}) => _id)
  const existing = new Set(await client.fetch('*[_id in $ids || _id in $drafts]._id', {
    ids,
    drafts: ids.map((id) => `drafts.${id}`),
  }))
  const pending = documents.filter(({_id}) => !existing.has(_id) && !existing.has(`drafts.${_id}`))
  if (!pending.length) {
    console.log('Dokumen sudah ada. Tidak ada konten yang ditimpa.')
    return
  }

  const uploaded = new Map()
  async function uploadImage(entry) {
    if (!entry.image) return
    const {src, alt} = entry.image
    if (!uploaded.has(src)) {
      const asset = await client.assets.upload('image', assets.get(src), {filename: basename(src)})
      uploaded.set(src, asset._id)
    }
    entry.image = {_type: 'image', asset: {_type: 'reference', _ref: uploaded.get(src)}, ...(alt ? {alt} : {})}
  }

  for (const doc of pending) {
    if (doc._type === 'programs') {
      for (const key of Object.keys(programs)) await uploadImage(doc[key])
    }
    if (doc._type === 'gallery') {
      for (const photo of doc.photos) await uploadImage(photo)
    }
  }

  const transaction = client.transaction()
  for (const document of pending) transaction.createIfNotExists(document)
  await transaction.commit({visibility: 'sync'})

  const published = await client.fetch(dashboardQuery, {}, {perspective: 'published'})
  const expected = {
    site: 'siteSettings',
    schedule: 'weeklySchedule',
    friday: 'fridayRoster',
    finances: 'finances',
    programs: 'programs',
    gallery: 'gallery',
    verses: 'dailyVerses',
  }
  for (const [key, id] of Object.entries(expected)) {
    if (pending.some((doc) => doc._id === id) && !published[key]) {
      throw new Error(`Dokumen ${id} belum muncul dalam kueri publik.`)
    }
  }
  console.log(`${pending.length} dokumen tersedia melalui kueri publik. ${documents.length - pending.length} dokumen yang sudah ada dilewati.`)
}

seed().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
