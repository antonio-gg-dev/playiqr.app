import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TrigmaLevel from '@/components/Trigma/TrigmaLevel.vue'
import { CampaignCatalog } from '@/lib/Trigma/CampaignCatalog'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'
import campaignData from '@/lib/Trigma/campaign-catalog-v1.json'

export default {
  component: TrigmaLevel,
} satisfies Meta<typeof TrigmaLevel>

export const pending: StoryObj<typeof TrigmaLevel> = {
  args: { level: 20 },
  render: () => ({
    components: { TrigmaLevel },

    setup() {
      return {
        level: 20,
        campaignCatalog: CampaignCatalog.fromJSON(campaignData),
        campaignProgress: new CampaignProgress(),
      }
    },

    template:
      '<TrigmaLevel :level="level" :campaign-catalog="campaignCatalog" :campaign-progress="campaignProgress" />',
  }),
}

export const completed: StoryObj<typeof TrigmaLevel> = {
  args: { level: 20 },
  render: () => ({
    components: { TrigmaLevel },

    setup() {
      const campaignProgress = new CampaignProgress()

      campaignProgress.setCompleted(20, true)

      return {
        level: 20,
        campaignCatalog: CampaignCatalog.fromJSON(campaignData),
        campaignProgress,
      }
    },

    template:
      '<TrigmaLevel :level="level" :campaign-catalog="campaignCatalog" :campaign-progress="campaignProgress" />',
  }),
}
