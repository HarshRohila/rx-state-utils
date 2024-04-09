import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'

import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      bundler: 'vite',
      webServerCommands: { default: 'nx run react-example:serve', production: 'nx run react-example:preview' },
      ciWebServerCommand: 'nx run react-example:serve-static',
    }),
    baseUrl: 'http://localhost:4201',
  },
})
