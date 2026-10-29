import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h } from 'vue'
import SelectField from '@/components/Shared/Forms/SelectField.vue'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'

const themeLabels: Record<string, string> = {
  [ThemeMode.Auto]: 'Automatic',
  [ThemeMode.Light]: 'Light',
  [ThemeMode.Dark]: 'Dark',
}

export default {
  component: SelectField,
  args: {
    id: 'theme',
    label: 'Theme',
    modelValue: ThemeMode.Auto,
    options: Object.values(ThemeMode),
  },
  render: (args) =>
    h(SelectField, args, {
      option: ({ value }: { value: string }) => themeLabels[value] ?? value,
    }),
} satisfies Meta<typeof SelectField>

export const automatic: StoryObj<typeof SelectField> = {}

export const disabled: StoryObj<typeof SelectField> = {
  args: {
    disabled: true,
  },
}
