<TrigmaOptions :preferences="preferences" />

<script setup lang="ts">
import { use } from '@/components/Shared/use'
import TrigmaOptions from '@/components/Trigma/TrigmaOptions.vue'
import { Preferences } from '@/lib/Shared/Preferences/Preferences'

const preferences = use(Preferences.KEY)
</script>
