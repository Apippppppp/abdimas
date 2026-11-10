import {defineArrayMember, defineField, defineType} from 'sanity'

const requiredText = (name: string, title: string, max = 100) =>
  defineField({
    name,
    title,
    type: 'string',
    validation: (rule) => rule.required().max(max),
  })

const shortText = (name: string, title: string, max = 100) =>
  defineField({name, title, type: 'string', validation: (rule) => rule.max(max)})

const heading = (title: string, name = 'title') =>
  defineField({
    name,
    title,
    type: 'text',
    rows: 2,
    validation: (rule) => rule.required().max(100),
  })

const amount = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'number',
    description: 'Masukkan nominal dalam rupiah.',
    validation: (rule) => rule.required().integer().min(0).max(Number.MAX_SAFE_INTEGER),
  })

const imageField = (required = false) =>
  defineField({
    name: 'image',
    title: 'Foto',
    type: 'image',
    fields: [
      defineField({
        name: 'alt',
        title: 'Teks alternatif',
        type: 'string',
        description: 'Deskripsikan isi foto jika menyampaikan informasi penting.',
        validation: (rule) => rule.max(160),
      }),
    ],
    validation: (rule) => (required ? rule.required().assetRequired() : rule.assetRequired()),
  })

const verseFields = [
  defineField({
    name: 'arab',
    title: 'Teks Arab',
    type: 'text',
    rows: 3,
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'translation',
    title: 'Terjemahan',
    type: 'text',
    rows: 3,
    validation: (rule) => rule.required(),
  }),
  requiredText('ref', 'Surah dan nomor ayat'),
  defineField({
    name: 'source',
    title: 'Tautan sumber',
    type: 'url',
    validation: (rule) => rule.uri({scheme: ['https', 'http']}),
  }),
]

export const documents = [
  defineType({
    name: 'siteSettings',
    title: 'Identitas Masjid',
    type: 'document',
    fields: [
      requiredText('name', 'Nama masjid'),
      requiredText('location', 'Lokasi'),
      requiredText('pageTitle', 'Judul tab browser'),
      requiredText('heading', 'Judul dashboard'),
      requiredText('footer', 'Pesan penutup', 180),
      defineField({
        name: 'sampleData',
        title: 'Tampilkan penanda data contoh',
        description: 'Matikan setelah jadwal, petugas, saldo, dan nominal donasi diverifikasi.',
        type: 'boolean',
        initialValue: true,
      }),
      requiredText('sampleLabel', 'Teks penanda data contoh'),
    ],
  }),
  defineType({
    name: 'weeklySchedule',
    title: 'Kegiatan Rutin',
    type: 'document',
    fields: [
      heading('Judul bagian'),
      requiredText('subtitle', 'Subjudul'),
      defineField({
        name: 'entries',
        title: 'Jadwal mingguan',
        type: 'array',
        of: [
          defineArrayMember({
            name: 'activity',
            type: 'object',
            fields: [
              defineField({
                name: 'day',
                title: 'Hari',
                type: 'string',
                options: {list: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']},
                validation: (rule) => rule.required(),
              }),
              requiredText('title', 'Nama kegiatan'),
              shortText('detail', 'Keterangan'),
              requiredText('time', 'Waktu'),
              shortText('duration', 'Durasi atau zona waktu'),
              defineField({
                name: 'kind',
                title: 'Jenis kegiatan',
                type: 'string',
                options: {
                  list: [
                    {title: 'Kajian', value: 'book'},
                    {title: 'Kegiatan kelompok', value: 'group'},
                    {title: 'Ibadah', value: 'mosque'},
                  ],
                },
              }),
            ],
            preview: {select: {title: 'title', subtitle: 'day'}},
          }),
        ],
      }),
    ],
  }),
  defineType({
    name: 'fridayRoster',
    title: 'Petugas Jumat',
    type: 'document',
    fields: [
      heading('Judul bagian'),
      shortText('khatib', 'Khatib'),
      shortText('imam', 'Imam'),
      shortText('muadzin', 'Muadzin'),
      shortText('bilal', 'Bilal'),
    ],
  }),
  defineType({
    name: 'finances',
    title: 'Saldo Keuangan',
    type: 'document',
    fields: [
      requiredText('title', 'Judul bagian'),
      defineField({
        name: 'balances',
        title: 'Daftar saldo kas',
        type: 'array',
        of: [
          defineArrayMember({
            name: 'balance',
            type: 'object',
            fields: [
              requiredText('label', 'Nama kas'),
              shortText('detail', 'Keterangan'),
              amount('amount', 'Saldo'),
            ],
            preview: {select: {title: 'label', subtitle: 'detail'}},
          }),
        ],
      }),
    ],
  }),
  defineType({
    name: 'programs',
    title: 'Layanan, Program, dan Donasi',
    type: 'document',
    fields: [
      defineField({name: 'ambulance', title: 'Ambulance', type: 'program', validation: (rule) => rule.required()}),
      defineField({name: 'wakaf', title: 'Wakaf', type: 'program', validation: (rule) => rule.required()}),
      defineField({name: 'qurban', title: 'Qurban', type: 'program', validation: (rule) => rule.required()}),
      defineField({name: 'carpet', title: 'Donasi', type: 'program', validation: (rule) => rule.required()}),
      requiredText('donationLabel', 'Label nominal donasi'),
      amount('donationTotal', 'Total donasi terkumpul'),
    ],
  }),
  defineType({
    name: 'gallery',
    title: 'Galeri Kegiatan',
    type: 'document',
    fields: [
      requiredText('label', 'Label menu'),
      requiredText('category', 'Kategori'),
      heading('Judul galeri'),
      defineField({
        name: 'photos',
        title: 'Foto kegiatan',
        type: 'array',
        of: [
          defineArrayMember({
            name: 'photo',
            type: 'object',
            fields: [
              imageField(true),
              requiredText('caption', 'Keterangan foto', 180),
              defineField({name: 'date', title: 'Tanggal kegiatan', type: 'date'}),
            ],
            preview: {select: {title: 'caption', subtitle: 'date', media: 'image'}},
          }),
        ],
      }),
    ],
  }),
  defineType({
    name: 'dailyVerses',
    title: 'Ayat Hari Ini',
    type: 'document',
    fields: [
      requiredText('title', 'Judul bagian'),
      defineField({
        name: 'rotation',
        title: 'Ayat rotasi',
        description: 'Ditampilkan bergantian jika tidak ada ayat khusus untuk tanggal hari ini.',
        type: 'array',
        of: [
          defineArrayMember({
            name: 'verse',
            type: 'object',
            fields: verseFields,
            preview: {select: {title: 'ref'}},
          }),
        ],
        validation: (rule) => rule.required().min(1),
      }),
      defineField({
        name: 'dated',
        title: 'Ayat untuk tanggal tertentu',
        description: 'Tanggal mengikuti waktu Jakarta (WIB).',
        type: 'array',
        of: [
          defineArrayMember({
            name: 'datedVerse',
            type: 'object',
            fields: [
              defineField({name: 'date', title: 'Tanggal tayang', type: 'date', validation: (rule) => rule.required()}),
              ...verseFields,
            ],
            preview: {select: {title: 'ref', subtitle: 'date'}},
          }),
        ],
        validation: (rule) =>
          rule.custom((entries) => {
            const dates = (entries ?? []).map((entry) => (entry as {date?: string}).date).filter(Boolean)
            return new Set(dates).size === dates.length || 'Gunakan satu ayat khusus per tanggal.'
          }),
      }),
    ],
  }),
]

const program = defineType({
  name: 'program',
  title: 'Informasi program',
  type: 'object',
  fields: [
    requiredText('label', 'Label menu'),
    shortText('note', 'Keterangan di menu'),
    requiredText('category', 'Kategori'),
    heading('Judul program'),
    defineField({
      name: 'description',
      title: 'Deskripsi',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(280),
    }),
    imageField(),
  ],
})

export const schemaTypes = [...documents, program]
