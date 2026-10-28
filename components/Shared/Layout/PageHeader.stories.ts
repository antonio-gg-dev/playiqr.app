import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PageHeader from '@/components/Shared/Layout/PageHeader.vue'

export default {
  title: 'Shared/Layout/PageHeader',
  component: PageHeader,
  args: { title: 'IQR Trigma' },
} satisfies Meta<typeof PageHeader>

export const main: StoryObj<typeof PageHeader> = {}

export const secondary: StoryObj<typeof PageHeader> = {
  args: { title: 'Options', backHref: '/trigma', backLabel: 'Back to menu' },
}
