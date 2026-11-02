/// <reference types="vite/client" />

import { defineComponent, type Component } from 'vue'
import { type Meta, type StoryObj } from '@storybook/vue3-vite'

const iconModules = import.meta.glob('./*.vue', { eager: true })

const icons = Object.entries(iconModules).map(
  ([
    path,
    module,
  ]) => ({
    component: (module as { default: Component }).default,
    displayName: path
      .replace('./', '')
      .replace('.vue', '')
      .replace(/([A-Z])/g, ' $1')
      .trim(),
    name: path.replace('./', '').replace('.vue', ''),
  }),
)

const OverviewComponent = defineComponent({
  setup() {
    return {
      icons,
      copyToClipboard: async (text: string): Promise<void> => {
        await window.navigator.clipboard.writeText(`<${text} />`)
      },
    }
  },

  template: `
    <div class="grid grid-cols-10 gap-2 p-2">
      <button
        v-for="icon in icons"
        :key="icon.name"
        @click="copyToClipboard(icon.name)"
        class="flex flex-col gap-2 items-center justify-center p-2 cursor-pointer text-center aspect-square border border-orange-300 hover:bg-orange-100 active:bg-orange-200 active:text-blue-700 hover:text-blue-800 transition-colors"
      >
        <component
          :is="icon.component"
          class="h-12 min-w-12"
        />

        <span class="text-xs break-words max-w-full [word-spacing:-0.2rem]">
          {{ icon.displayName }}
        </span>
      </button>
    </div>
  `,
})

export default {
  component: OverviewComponent,
} satisfies Meta<typeof OverviewComponent>

export const overview: StoryObj<typeof OverviewComponent> = {}
