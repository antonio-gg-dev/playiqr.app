<TrigmaLevels
  :campaign-catalog="campaignCatalog"
  :campaign-progress="campaignProgress"
/>

<script setup lang="ts">
import { use } from '@/components/Shared/use'
import TrigmaLevels from '@/components/Trigma/TrigmaLevels.vue'
import { CampaignCatalog } from '@/lib/Trigma/CampaignCatalog'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'
import campaignData from '@/lib/Trigma/campaign-catalog-v1.json'

const campaignCatalog = CampaignCatalog.fromJSON(campaignData)
const campaignProgress = use(CampaignProgress.KEY)
</script>
