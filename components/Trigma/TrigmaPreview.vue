<template>
  <PageHeader
    title="IQR Trigma"
    back-href="/trigma"
    :back-label="$t('returnToMenu')"
  />

  <main class="trigma-preview__content">
    <TrigmaBoard
      v-if="blockedCellIds"
      :blocked-cell-ids="blockedCellIds"
    />
    <p
      v-else
      role="alert"
    >
      {{ $t('invalidBlockers', { lastCellId }) }}
    </p>
  </main>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import PageHeader from '@/components/Shared/Layout/PageHeader.vue'
import TrigmaBoard from '@/components/Trigma/TrigmaBoard.vue'

export default defineComponent({
  components: {
    PageHeader,
    TrigmaBoard,
  },

  props: {
    blockedCellIds: {
      type: Array as PropType<readonly number[] | null>,
      default: null,
    },
    lastCellId: {
      type: Number,
      required: true,
    },
  },
})
</script>

<style lang="scss">
.trigma-preview {
  &__content {
    @apply px-6 pb-8;
  }
}
</style>
