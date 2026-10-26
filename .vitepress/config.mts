import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: 'pages',
  cleanUrls: true,
  title: 'IQR',
  description: 'Open-source 3D-printable logic puzzles with interactive challenges.',

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
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
