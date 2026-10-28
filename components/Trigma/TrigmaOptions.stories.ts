import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TrigmaOptions from '@/components/Trigma/TrigmaOptions.vue'
import { Preferences } from '@/lib/Shared/Preferences/Preferences'
import { Language } from '@/lib/Shared/Preferences/Language'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'

export default {
  component: TrigmaOptions,

  render: (_args, context) => ({
    components: { TrigmaOptions },

    setup() {
      const { locale } = useI18n()
      const preferences = new Preferences()

      if (context.globals.theme === ThemeMode.Dark) {
        preferences.setTheme(ThemeMode.Dark)
      }

      preferences.setLanguage(context.globals.language === Language.Spanish ? Language.Spanish : Language.English)
      watch(
        () => preferences.language,
        (language) => {
          locale.value = language
        },
        { immediate: true },
      )

      return { preferences }
    },

    template: '<TrigmaOptions :preferences="preferences" />',
  }),
} satisfies Meta<typeof TrigmaOptions>

export const english: StoryObj<typeof TrigmaOptions> = {}

export const spanishDark: StoryObj<typeof TrigmaOptions> = {
  globals: {
    theme: ThemeMode.Dark,
    language: Language.Spanish,
  },
}
