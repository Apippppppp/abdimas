import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {dataset, projectId} from './content.mjs'
import {documents, schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Konten Masjid Al-Falah',
  projectId,
  dataset,
  plugins: [
    structureTool({
      title: 'Konten Dashboard',
      structure: (S) =>
        S.list()
          .title('Konten Dashboard')
          .items(documents.map(({name}) => S.listItem().singleton(name))),
    }),
    visionTool(),
  ],
  document: {
    singletons: documents.map(({name}) => ({documentId: name, schemaType: name})),
  },
  schema: {
    types: schemaTypes,
  },
})
