import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TrigmaLevels from '@/components/Trigma/TrigmaLevels.vue'
import { CampaignCatalog } from '@/lib/Trigma/CampaignCatalog'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'
import campaignData from '@/lib/Trigma/campaign-catalog-v1.json'

export default {
  component: TrigmaLevels,

  render: () => ({
    components: { TrigmaLevels },

    setup() {
      const campaignProgress = new CampaignProgress()

      for (const level of [
        1,
        2,
        21,
        41,
        61,
        81,
      ]) {
        campaignProgress.setCompleted(level, true)
      }

      return {
        campaignCatalog: CampaignCatalog.fromJSON(campaignData),
        campaignProgress,
      }
    },

    template: '<TrigmaLevels :campaign-catalog="campaignCatalog" :campaign-progress="campaignProgress" />',
  }),
} satisfies Meta<typeof TrigmaLevels>

export const english: StoryObj<typeof TrigmaLevels> = {}
