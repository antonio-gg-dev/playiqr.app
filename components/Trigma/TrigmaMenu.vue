<template>
  <PageHeader title="IQR Trigma" />

  <main class="trigma-menu__content">
    <a
      class="trigma-menu__mode"
      href="/trigma/levels"
    >
      <span class="trigma-menu__mode-title">{{ $t('levels') }}</span>
      <span class="trigma-menu__mode-progress">{{ campaignProgress.completedCount }}/100</span>
      <span
        class="trigma-menu__progress"
        role="progressbar"
        :aria-label="$t('campaignProgress')"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="campaignProgress.completedCount"
      >
        <span
          class="trigma-menu__progress-indicator"
          :style="{ width: `${campaignProgress.completedCount}%` }"
        />
      </span>
    </a>

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
import type { PropType } from 'vue'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'

export default defineComponent({
  components: {
    PageHeader,
    OptionsIcon,
  },

  props: {
    campaignProgress: {
      type: Object as PropType<CampaignProgress>,
      required: true,
    },
  },
})
</script>

<style lang="scss">
.trigma-menu {
  &__content {
    @apply flex flex-1 flex-col gap-4 px-6 pb-8;
  }

  &__mode {
    @apply flex min-h-28 flex-col gap-3 rounded-xl border border-gray-300 bg-gray-100 p-6 font-heading text-xl font-medium text-gray-500;

    &:disabled {
      @apply cursor-not-allowed;
    }

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }

    @include dark {
      @apply border-gray-700 bg-gray-900 text-gray-400;
    }
  }

  &__mode-title {
    @apply self-start;
  }

  &__mode-progress {
    @apply self-start font-sans text-sm font-normal;
  }

  &__progress {
    @apply h-2 w-full overflow-hidden rounded-full bg-gray-300;

    @include dark {
      @apply bg-gray-700;
    }
  }

  &__progress-indicator {
    @apply block h-full rounded-full bg-blue-600;
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
