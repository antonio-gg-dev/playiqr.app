import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SelectField from '@/components/Shared/Forms/SelectField.vue'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'

export default {
  component: SelectField,
  args: {
    id: 'theme',
    label: 'Theme',
    modelValue: ThemeMode.Auto,
    options: [
      {
        value: ThemeMode.Auto,
        label: 'Automatic',
      },
      {
        value: ThemeMode.Light,
        label: 'Light',
      },
      {
        value: ThemeMode.Dark,
        label: 'Dark',
      },
    ],
  },
} satisfies Meta<typeof SelectField>

export const automatic: StoryObj<typeof SelectField> = {}

export const disabled: StoryObj<typeof SelectField> = {
  args: {
    disabled: true,
  },
}
