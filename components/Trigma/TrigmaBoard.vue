<template>
  <svg
    class="trigma-board trigma-board__svg"
    :viewBox="viewBox"
    role="img"
    :aria-label="$t('boardDescription', { blockers: blockedCellIds.join(', ') })"
  >
    <polygon
      v-for="(cell, id) in cells"
      :key="id"
      :class="{
        'trigma-board__cell': true,
        'trigma-board__cell--blocked': blockedCellIds.includes(id),
      }"
      :data-cell-id="id"
      :points="pointsFor(cell)"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { Board } from '@/lib/Trigma/Board'
import type { Cell } from '@/lib/Trigma/Cell'

const TRIANGLE_HEIGHT = Math.sqrt(3) / 2

export default defineComponent({
  props: {
    blockedCellIds: {
      type: Array as PropType<readonly number[]>,
      required: true,
    },
  },

  data() {
    return { cells: new Board().cells }
  },

  computed: {
    viewBox(): string {
      return [
        0,
        0,
        Board.SIDE_LENGTH,
        Board.SIDE_LENGTH * TRIANGLE_HEIGHT,
      ].join(' ')
    },
  },

  methods: {
    pointsFor(cell: Cell): string {
      return cell
        .vertices()
        .map(
          ([
            a,
            b,
          ]) =>
            [
              (Board.SIDE_LENGTH - a + b) / 2,
              (a + b) * TRIANGLE_HEIGHT,
            ].join(','),
        )
        .join(' ')
    },
  },
})
</script>

<style lang="scss">
.trigma-board {
  &__svg {
    @apply block h-auto w-full max-w-xl;
  }

  &__cell {
    @apply fill-gray-100 stroke-gray-700 stroke-2;

    vector-effect: non-scaling-stroke;

    &--blocked {
      @apply fill-orange-500;
    }
  }
}
</style>
