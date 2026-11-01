// https://vitepress.dev/guide/custom-theme
import BaseLayout from '@/components/Shared/Layout/BaseLayout.vue'
import type { Theme } from 'vitepress'
import { useRouter, inBrowser } from 'vitepress'
import { defineComponent, h } from 'vue'
import { Preferences } from '@/lib/Shared/Preferences/Preferences'
import { Language } from '@/lib/Shared/Preferences/Language'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'
import { use } from '@/components/Shared/use'
import { createLocalization } from '@/i18n.config'
import '@/styles/index.scss'

const Layout = defineComponent({
  data() {
    return {
      preferences: use(Preferences.KEY),
      campaignProgress: use(CampaignProgress.KEY),
      router: useRouter(),
    }
  },

  watch: {
    'preferences.language': {
      immediate: true,

      handler(language: Language) {
        this.$i18n.locale = language
      },
    },
  },

  created() {
    if (inBrowser) {
      this.campaignProgress.initialize(window)
    }

    this.$watch(
      () => [
        this.router.route.path,
        this.preferences.language,
      ],
      () => {
        if (inBrowser) {
          document.documentElement.lang = this.preferences.language
        }
      },
      { flush: 'post' },
    )
  },

  async mounted() {
    await this.$nextTick()
    this.preferences.initialize(window)
  },

  unmounted() {
    this.preferences.dispose()
    this.campaignProgress.dispose()
  },

  render() {
    return h(BaseLayout)
  },
})

export default {
  Layout,

  enhanceApp({ app }) {
    app.provide(Preferences.KEY, new Preferences())
    app.provide(CampaignProgress.KEY, new CampaignProgress())
    app.use(createLocalization())
  },
} satisfies Theme
