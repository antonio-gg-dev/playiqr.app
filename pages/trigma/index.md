<TrigmaMenu v-if="blockedCellIds === undefined" />
<TrigmaPreview v-else :blocked-cell-ids="blockedCellIds" :last-cell-id="boardCellCount - 1" />

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vitepress'
import TrigmaMenu from '@/components/Trigma/TrigmaMenu.vue'
import TrigmaPreview from '@/components/Trigma/TrigmaPreview.vue'
import { Board } from '@/lib/Trigma/Board'

const router = useRouter()

const BLOCKED_CELL_COUNT = 4
const boardCellCount = new Board().cells.length
const blockedCellIds = ref<readonly number[] | null | undefined>(undefined)

function readQuery() {
  const blockers = new URLSearchParams(window.location.search).getAll('b')

  if (blockers.length === 0) {
    blockedCellIds.value = undefined

    return
  }

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
}

const previousRouteChange = router.onAfterRouteChanged
const onRouteChange: NonNullable<typeof router.onAfterRouteChanged> = async (to) => {
  await previousRouteChange?.(to)
  readQuery()
}

onMounted(() => {
  readQuery()

  router.onAfterRouteChanged = onRouteChange
})

onUnmounted(() => {
  if (router.onAfterRouteChanged === onRouteChange) {
    router.onAfterRouteChanged = previousRouteChange
  }
})
</script>
