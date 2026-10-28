import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: 'pages',
  cleanUrls: true,
  appearance: false,
  title: 'IQR',
  description: 'Open-source 3D-printable logic puzzles with interactive challenges.',

  head: [
    [
      'meta',
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
      },
    ],
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          additionalData: '@use "@/styles/mixins/dark" as *;',
        },
      },
    },

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('..', import.meta.url)),
      },
    },
  },
})
