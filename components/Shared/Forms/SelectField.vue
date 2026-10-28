<template>
  <div class="select-field__container">
    <label
      class="select-field__label"
      :for="id"
      >{{ label }}</label
    >

    <select
      :id="id"
      class="select-field__control"
      :value="modelValue"
      :disabled="disabled"
      @change="onChange"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
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
      type: Array as PropType<readonly { value: string; label: string }[]>,
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

  methods: {
    onChange(event: Event) {
      if (event.target instanceof HTMLSelectElement) {
        this.$emit('update:modelValue', event.target.value)
      }
    },
  },
})
</script>

<style lang="scss">
.select-field {
  &__container {
    @apply flex flex-col gap-2;
  }

  &__label {
    @apply text-base font-semibold;
  }

  &__control {
    @apply min-h-12 w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-base text-gray-950;

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }

    @include dark {
      @apply border-gray-500 bg-gray-900 text-gray-100;
    }
  }
}
</style>
