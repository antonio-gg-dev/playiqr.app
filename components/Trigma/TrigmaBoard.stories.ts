import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TrigmaBoard from '@/components/Trigma/TrigmaBoard.vue'

export default {
  component: TrigmaBoard,
  args: {
    blockedCellIds: [
      0,
      11,
      21,
      27,
    ],
  },
} satisfies Meta<typeof TrigmaBoard>

export const example: StoryObj<typeof TrigmaBoard> = {}

export const other_challenge: StoryObj<typeof TrigmaBoard> = {
  args: {
    blockedCellIds: [
      35,
      8,
      4,
      16,
    ],
  },
}
