<template>
  <div class="test-button">
    <button
      class="test-button__control"
      :class="{ 'test-button__control--secondary': secondary }"
      type="button"
    >
      {{ text }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TestButton',
  props: {
    text: {
      type: String,
      required: true,
    },
    secondary: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<style lang="scss">
.test-button {
  &__control {
    @apply rounded-md bg-blue-600 px-4 py-2 font-semibold text-white;

    &--secondary {
      @apply bg-orange-500;
    }
  }
}
</style>
