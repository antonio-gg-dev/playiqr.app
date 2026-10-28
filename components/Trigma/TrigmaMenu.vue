<template>
  <PageHeader title="IQR Trigma" />

  <main class="trigma-menu__content">
    <button
      class="trigma-menu__mode"
      type="button"
      disabled
    >
      {{ $t('levels') }}
    </button>

    <button
      class="trigma-menu__mode"
      type="button"
      disabled
    >
      {{ $t('dailyChallenge') }}
    </button>

    <a
      class="trigma-menu__options"
      href="/trigma/options"
    >
      <OptionsIcon
        class="trigma-menu__icon"
        aria-hidden="true"
      />{{ $t('options') }}
    </a>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageHeader from '@/components/Shared/Layout/PageHeader.vue'
import OptionsIcon from '@/components/Shared/Icons/OptionsIcon.vue'

export default defineComponent({
  components: {
    PageHeader,
    OptionsIcon,
  },
})
</script>

<style lang="scss">
.trigma-menu {
  &__content {
    @apply flex flex-1 flex-col gap-4 px-6 pb-8;
  }

  &__mode {
    @apply min-h-28 rounded-xl border border-gray-300 bg-gray-100 p-6 font-heading text-xl font-medium text-gray-500;

    &:disabled {
      @apply cursor-not-allowed;
    }

    @include dark {
      @apply border-gray-700 bg-gray-900 text-gray-400;
    }
  }

  &__options {
    @apply flex min-h-12 items-center gap-3 self-start rounded-lg px-3 py-2 font-medium;

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
    @apply h-5 w-5;
  }
}
</style>
