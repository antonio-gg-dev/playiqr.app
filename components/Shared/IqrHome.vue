<template>
  <PageHeader title="IQR" />

  <main class="iqr-home__content">
    <a
      class="iqr-home__puzzle"
      href="/trigma"
      >IQR Trigma</a
    >
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageHeader from '@/components/Shared/Layout/PageHeader.vue'

export default defineComponent({ components: { PageHeader } })
</script>

<style lang="scss">
.iqr-home {
  &__content {
    @apply flex flex-1 flex-col px-6 pb-8;
  }

  &__puzzle {
    @apply flex min-h-32 items-center justify-center rounded-xl border border-gray-300 bg-white p-6 font-heading text-xl font-medium;

    &:hover {
      @apply border-gray-500;
    }

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }

    @include dark {
      @apply border-gray-600 bg-gray-900;
    }
  }
}
</style>
