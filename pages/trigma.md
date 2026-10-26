# Trigma

<TrigmaBoard v-if="blockedCellIds" :blocked-cell-ids="blockedCellIds" />
<p v-else-if="blockedCellIds === null">
  El parámetro <code>b</code> debe contener cuatro IDs distintos del 0 al {{ boardCellCount - 1 }} separados por comas.
</p>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TrigmaBoard from '@/components/Trigma/TrigmaBoard.vue'
import { Board } from '@/lib/Trigma/Board'

const BLOCKED_CELL_COUNT = 4
const boardCellCount = new Board().cells.length
const blockedCellIds = ref<readonly number[] | null | undefined>(undefined)

onMounted(() => {
  const blockers = new URLSearchParams(window.location.search).getAll('b')
  if (blockers.length !== 1) {
    blockedCellIds.value = null
    return
  }

  const fields = blockers[0].split(',')
  if (fields.length !== BLOCKED_CELL_COUNT || fields.some((field) => !/^\d+$/.test(field))) {
    blockedCellIds.value = null
    return
  }

  const ids = fields.map(Number)
  blockedCellIds.value =
    ids.every((id) => Number.isSafeInteger(id) && id < boardCellCount) &&
    new Set(ids).size === BLOCKED_CELL_COUNT
      ? ids
      : null
})
</script>
