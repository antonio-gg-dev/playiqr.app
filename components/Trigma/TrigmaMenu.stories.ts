import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TrigmaMenu from '@/components/Trigma/TrigmaMenu.vue'
import { Language } from '@/lib/Shared/Preferences/Language'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'

export default { component: TrigmaMenu } satisfies Meta<typeof TrigmaMenu>

export const english: StoryObj<typeof TrigmaMenu> = {}

export const spanish_dark: StoryObj<typeof TrigmaMenu> = {
  globals: {
    theme: ThemeMode.Dark,
    language: Language.Spanish,
  },
}
