import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TestButton from '@/components/Shared/TestButton/TestButton.vue'

export default {
  title: 'Shared/TestButton',
  component: TestButton,
  args: {
    text: 'Click me!',
    secondary: false,
  },
} satisfies Meta<typeof TestButton>

export const primary: StoryObj<typeof TestButton> = {}

export const secondary: StoryObj<typeof TestButton> = {
  args: {
    secondary: true,
  },
}
