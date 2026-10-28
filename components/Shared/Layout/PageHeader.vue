<template>
  <header class="page-header__container">
    <a
      v-if="backHref"
      class="page-header__return"
      :href="backHref"
      :aria-label="backLabel"
    >
      <HomeIcon
        class="page-header__icon"
        aria-hidden="true"
      />
    </a>
    <h1 class="page-header__title">
      {{ title }}
    </h1>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HomeIcon from '@/components/Shared/Icons/HomeIcon.vue'

export default defineComponent({
  components: { HomeIcon },

  props: {
    title: {
      type: String,
      required: true,
    },
    backHref: {
      type: String,
      default: undefined,
    },
    backLabel: {
      type: String,
      default: '',
    },
  },
})
</script>

<style lang="scss">
.page-header {
  &__container {
    @apply flex items-center gap-3 px-6 py-8;
  }

  &__title {
    @apply min-w-0 text-2xl font-semibold;
  }

  &__return {
    @apply flex h-12 w-12 shrink-0 items-center justify-center rounded-lg;

    &:hover {
      @apply bg-gray-200;

      @include dark {
        @apply bg-gray-800;
      }
    }

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }
  }

  &__icon {
    @apply h-6 w-6;
  }
}
</style>
