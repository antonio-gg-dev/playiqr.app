// https://vitepress.dev/guide/custom-theme
import Layout from '@/components/Shared/Layout/Layout.vue'
import type { Theme } from 'vitepress'
import '@/styles/index.scss'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
} satisfies Theme

