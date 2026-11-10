export const projectId = 'hlbvzbbi'
export const dataset = 'production'
export const apiVersion = '2025-02-19'

const image = 'image{"src": asset->url, alt}'
const program = `{label, note, category, title, description, ${image}}`
const verse = '{arab, translation, ref, source}'

export const dashboardQuery = `{
  "site": *[_id == "siteSettings"][0]{
    name, location, pageTitle, heading, footer, sampleData, sampleLabel
  },
  "schedule": *[_id == "weeklySchedule"][0]{
    title, subtitle, entries[]{_key, day, title, detail, time, duration, kind}
  },
  "friday": *[_id == "fridayRoster"][0]{title, khatib, imam, muadzin, bilal},
  "finances": *[_id == "finances"][0]{title, balances[]{_key, label, detail, amount}},
  "programs": *[_id == "programs"][0]{
    ambulance${program}, wakaf${program}, qurban${program}, carpet${program},
    donationLabel, donationTotal
  },
  "gallery": *[_id == "gallery"][0]{
    label, category, title, photos[defined(image.asset->url)][]{_key, caption, date, ${image}}
  },
  "verses": *[_id == "dailyVerses"][0]{
    title, rotation[]${verse}, dated[]{date, arab, translation, ref, source}
  }
}`
