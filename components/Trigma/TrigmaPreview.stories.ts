import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TrigmaPreview from '@/components/Trigma/TrigmaPreview.vue'
import { Board } from '@/lib/Trigma/Board'

export default {
  component: TrigmaPreview,
  args: {
    lastCellId: new Board().cells.length - 1,
    blockedCellIds: [
      0,
      11,
      21,
      27,
    ],
  },
} satisfies Meta<typeof TrigmaPreview>

export const challenge: StoryObj<typeof TrigmaPreview> = {}

export const invalid: StoryObj<typeof TrigmaPreview> = { args: { blockedCellIds: null } }
