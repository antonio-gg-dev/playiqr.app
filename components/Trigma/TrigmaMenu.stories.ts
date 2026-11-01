import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TrigmaMenu from '@/components/Trigma/TrigmaMenu.vue'
import { Language } from '@/lib/Shared/Preferences/Language'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'

export default {
  component: TrigmaMenu,

  render: () => ({
    components: { TrigmaMenu },

    setup() {
      return { campaignProgress: new CampaignProgress() }
    },

    template: '<TrigmaMenu :campaign-progress="campaignProgress" />',
  }),
} satisfies Meta<typeof TrigmaMenu>

export const english: StoryObj<typeof TrigmaMenu> = {}

export const spanish_dark: StoryObj<typeof TrigmaMenu> = {
  globals: {
    theme: ThemeMode.Dark,
    language: Language.Spanish,
  },
}
