// https://vitepress.dev/guide/custom-theme
import BaseLayout from '@/components/Shared/Layout/BaseLayout.vue'
import type { Theme } from 'vitepress'
import '@/styles/index.scss'

export default {
  Layout: BaseLayout,
  enhanceApp() {
    // ...
  },
} satisfies Theme
