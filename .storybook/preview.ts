import type { Preview } from '@storybook/vue3-vite'
import '@/styles/index.scss'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'
import { Language } from '@/lib/Shared/Preferences/Language'
import { createLocalization } from '@/i18n.config'
import { setup } from '@storybook/vue3-vite'
import { defineComponent } from 'vue'

setup((app) => {
  app.use(createLocalization())
})

export default {
  initialGlobals: { theme: ThemeMode.Light, language: Language.English },
  decorators: [
    (story, context) => {
      document.documentElement.dataset.theme =
        context.globals.theme === ThemeMode.Dark ? ThemeMode.Dark : ThemeMode.Light

      const decorator = defineComponent({
        beforeCreate() {
          this.$i18n.locale = context.globals.language === Language.Spanish ? Language.Spanish : Language.English
        },
        template: '<story />',
      })

      return decorator
    },
  ],
} satisfies Preview
