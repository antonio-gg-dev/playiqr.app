<template>
  <div
    ref="container"
    class="select-field__container"
  >
    <label
      :id="labelId"
      class="select-field__label"
      :for="triggerId"
      >{{ label }}</label
    >

    <button
      :id="triggerId"
      class="select-field__trigger"
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-controls="listboxId"
      :aria-expanded="isOpen"
      :aria-labelledby="labelId"
      :aria-activedescendant="activeOptionId"
      :disabled="disabled"
      @click="toggleListbox"
      @keydown="onKeydown"
    >
      <slot
        name="option"
        :value="modelValue"
        :selected="true"
        :active="isOpen && activeIndex === selectedIndex"
        context="selected"
        >{{ selectedValue }}</slot
      >
      <SelectFieldChevronIcon
        class="select-field__chevron"
        aria-hidden="true"
      />
    </button>

    <ul
      v-if="isOpen"
      :id="listboxId"
      class="select-field__listbox"
      role="listbox"
      :aria-labelledby="labelId"
    >
      <li
        v-for="(option, index) in options"
        :id="optionId(index)"
        :key="option"
        ref="optionElements"
        class="select-field__option"
        role="option"
        :aria-selected="option === modelValue"
        :data-value="option"
        :data-active="index === activeIndex"
        @mouseenter="setActiveOption(index)"
        @click="selectOption(option)"
      >
        <slot
          name="option"
          :value="option"
          :selected="option === modelValue"
          :active="index === activeIndex"
          context="option"
          >{{ option }}</slot
        >
      </li>
    </ul>

    <select
      :id="id"
      ref="nativeSelect"
      class="select-field__native"
      :value="modelValue"
      :disabled="disabled"
      tabindex="-1"
      aria-hidden="true"
      @change="onNativeChange"
    >
      <option
        v-for="option in options"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import SelectFieldChevronIcon from '@/components/Shared/Icons/SelectFieldChevronIcon.vue'

export default defineComponent({
  components: { SelectFieldChevronIcon },

  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    options: {
      type: Array as PropType<readonly string[]>,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: { 'update:modelValue': (value: string) => typeof value === 'string' },

  data() {
    return {
      isOpen: false,
      activeIndex: this.options.indexOf(this.modelValue),
      typeaheadBuffer: '',
      typeaheadTimer: null as ReturnType<typeof setTimeout> | null,
      documentPointerDownHandler: null as ((event: PointerEvent) => void) | null,
    }
  },

  computed: {
    labelId(): string {
      return `${this.id}-label`
    },

    triggerId(): string {
      return `${this.id}-trigger`
    },

    listboxId(): string {
      return `${this.id}-listbox`
    },

    selectedIndex(): number {
      return this.options.indexOf(this.modelValue)
    },

    selectedValue(): string {
      return this.modelValue
    },

    activeOptionId(): string | undefined {
      return this.isOpen && this.activeIndex >= 0 && this.activeIndex < this.options.length
        ? this.optionId(this.activeIndex)
        : undefined
    },
  },

  mounted() {
    this.documentPointerDownHandler = (event) => {
      this.onDocumentPointerDown(event)
    }
    document.addEventListener('pointerdown', this.documentPointerDownHandler)
  },

  beforeUnmount() {
    if (this.documentPointerDownHandler !== null) {
      document.removeEventListener('pointerdown', this.documentPointerDownHandler)
    }

    if (this.typeaheadTimer !== null) {
      clearTimeout(this.typeaheadTimer)
    }
  },

  methods: {
    optionId(index: number): string {
      return `${this.id}-option-${index.toString()}`
    },

    optionAt(index: number): string | undefined {
      return index < 0 ? undefined : this.options.at(index)
    },

    toggleListbox() {
      this.isOpen = !this.isOpen
      this.activeIndex = this.selectedIndex
    },

    setActiveOption(index: number) {
      this.activeIndex = index
    },

    selectOption(value: string, closeListbox = true) {
      const select = this.$refs.nativeSelect as HTMLSelectElement

      select.value = value
      select.dispatchEvent(new Event('input', { bubbles: true }))
      select.dispatchEvent(new Event('change', { bubbles: true }))
      this.isOpen = !closeListbox
      this.activeIndex = this.options.indexOf(value)
    },

    onKeydown(event: KeyboardEvent) {
      if (this.disabled) {
        return
      }

      if (this.isOpen) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()

          if (this.options.length === 0) {
            return
          }

          const direction = event.key === 'ArrowDown' ? 1 : -1
          this.activeIndex = Math.max(0, Math.min(this.activeIndex + direction, this.options.length - 1))

          return
        }

        if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault()
          const index = event.key === 'Home' ? 0 : this.options.length - 1
          const option = this.optionAt(index)

          if (option !== undefined) {
            this.selectOption(option, false)
          }

          return
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          const option = this.optionAt(this.activeIndex)

          if (option !== undefined) {
            this.selectOption(option)
          }

          return
        }

        if (event.key === 'Escape') {
          event.preventDefault()
          this.isOpen = false
          this.activeIndex = this.selectedIndex

          return
        }

        if (event.key === 'Tab') {
          const option = this.optionAt(this.activeIndex)

          if (option !== undefined) {
            this.selectOption(option)
          }

          return
        }

        if (this.handleTypeahead(event)) {
          return
        }

        return
      }

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        this.toggleListbox()

        return
      }

      if (this.options.length === 0) {
        return
      }

      let index = this.selectedIndex

      if (event.key === 'ArrowDown') {
        index = Math.min(index + 1, this.options.length - 1)
      } else if (event.key === 'ArrowUp') {
        index = Math.max(index - 1, 0)
      } else if (event.key === 'Home') {
        index = 0
      } else if (event.key === 'End') {
        index = this.options.length - 1
      } else if (this.handleTypeahead(event)) {
        return
      } else {
        return
      }

      event.preventDefault()
      const option = this.optionAt(index)

      if (option !== undefined) {
        this.selectOption(option)
      }
    },

    handleTypeahead(event: KeyboardEvent): boolean {
      if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) {
        return false
      }

      event.preventDefault()
      const character = event.key.toLocaleLowerCase()
      const previousBuffer = this.typeaheadBuffer
      const repeatedCharacter =
        previousBuffer.length > 0 && Array.from(previousBuffer).every((item) => item === character)

      this.typeaheadBuffer = repeatedCharacter ? character : `${previousBuffer}${character}`

      if (this.typeaheadTimer !== null) {
        clearTimeout(this.typeaheadTimer)
      }

      this.typeaheadTimer = setTimeout(() => {
        this.typeaheadBuffer = ''
        this.typeaheadTimer = null
      }, 500)

      const updateActiveOption = () => {
        const optionElements = this.$refs.optionElements as HTMLElement[] | undefined

        if (!optionElements || optionElements.length === 0) {
          return
        }

        const startIndex = repeatedCharacter ? (this.activeIndex + 1) % optionElements.length : 0

        for (let offset = 0; offset < optionElements.length; offset++) {
          const index = (startIndex + offset) % optionElements.length
          const optionText = optionElements[index].textContent.trim().toLocaleLowerCase()

          if (optionText.startsWith(this.typeaheadBuffer)) {
            this.activeIndex = index

            return
          }
        }
      }

      if (!this.isOpen) {
        this.isOpen = true
        this.activeIndex = this.selectedIndex
        void this.$nextTick(updateActiveOption)
      } else {
        updateActiveOption()
      }

      return true
    },

    onNativeChange(event: Event) {
      if (event.target instanceof HTMLSelectElement) {
        this.$emit('update:modelValue', event.target.value)
      }
    },

    onDocumentPointerDown(event: PointerEvent) {
      const container = this.$refs.container as HTMLElement

      if (event.target instanceof Node && !container.contains(event.target)) {
        this.isOpen = false
        this.activeIndex = this.selectedIndex
      }
    },
  },
})
</script>

<style lang="scss">
.select-field {
  &__container {
    @apply relative flex flex-col gap-2;
  }

  &__label {
    @apply text-base font-semibold;
  }

  &__trigger {
    @apply flex min-h-12 w-full cursor-pointer items-center justify-between rounded-lg border border-gray-400 bg-white px-3 py-2 text-left text-base text-gray-950;

    &:hover:not(:disabled) {
      @apply bg-gray-100;
    }

    &:active:not(:disabled) {
      @apply bg-gray-200;
    }

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }

    @include dark {
      @apply border-gray-500 bg-gray-900 text-gray-100;

      &:hover:not(:disabled) {
        @apply border-gray-400 bg-gray-800;
      }

      &:active:not(:disabled) {
        @apply bg-gray-700;
      }
    }
  }

  &__chevron {
    @apply h-5 w-5 shrink-0;
  }

  &__listbox {
    @apply absolute left-0 top-full z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-400 bg-white py-1 shadow-lg;

    @include dark {
      @apply border-gray-500 bg-gray-900;
    }
  }

  &__option {
    @apply flex min-h-10 cursor-pointer items-center px-3 py-2 text-base text-gray-950;

    &:hover,
    &[data-active='true'] {
      @apply bg-gray-200;
    }

    &[aria-selected='true'] {
      @apply font-semibold;
    }

    @include dark {
      @apply text-gray-100;

      &:hover,
      &[data-active='true'] {
        @apply bg-gray-800;
      }
    }
  }

  &__native {
    @apply sr-only;
  }
}
</style>
