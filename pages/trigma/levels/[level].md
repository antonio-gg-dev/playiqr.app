<TrigmaLevel
  :level="level"
  :campaign-catalog="campaignCatalog"
  :campaign-progress="campaignProgress"
/>

<script setup lang="ts">
import { useData } from 'vitepress'
import { use } from '@/components/Shared/use'
import TrigmaLevel from '@/components/Trigma/TrigmaLevel.vue'
import { CampaignCatalog } from '@/lib/Trigma/CampaignCatalog'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'
import campaignData from '@/lib/Trigma/campaign-catalog-v1.json'

const { params } = useData()
const campaignCatalog = CampaignCatalog.fromJSON(campaignData)
const campaignProgress = use(CampaignProgress.KEY)
const level = Number(params.value.level)
</script>
