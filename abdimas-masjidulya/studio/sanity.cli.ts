import {defineCliConfig} from 'sanity/cli'
import {dataset, projectId} from './content.mjs'

export default defineCliConfig({
  api: {projectId, dataset},
  deployment: {autoUpdates: true},
})
