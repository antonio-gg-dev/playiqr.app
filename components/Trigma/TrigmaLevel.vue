<template>
  <PageHeader
    :title="$t('campaignLevel', { level })"
    back-href="/trigma"
    :back-label="$t('returnToMenu')"
  />

  <main class="trigma-level__content">
    <p class="trigma-level__difficulty">{{ $t(entry.difficulty) }}</p>

    <TrigmaBoard :blocked-cell-ids="entry.blockedCellIds" />

    <button
      :class="{
        'trigma-level__completion': true,
        'trigma-level__completion--completed': isCompleted,
      }"
      type="button"
      :aria-pressed="isCompleted"
      @click="toggleCompletion"
    >
      {{ $t(isCompleted ? 'completedLevel' : 'completeLevel') }}
    </button>

    <a
      v-if="isCompleted && level < 100"
      class="trigma-level__next"
      :href="`/trigma/levels/${(level + 1).toString()}`"
    >
      {{ $t('nextChallenge') }}
    </a>
  </main>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import PageHeader from '@/components/Shared/Layout/PageHeader.vue'
import TrigmaBoard from '@/components/Trigma/TrigmaBoard.vue'
import { CampaignCatalog } from '@/lib/Trigma/CampaignCatalog'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'
import { Confetti } from '@/lib/Trigma/Confetti'

export default defineComponent({
  components: {
    PageHeader,
    TrigmaBoard,
  },

  props: {
    level: {
      type: Number,
      required: true,
    },
    campaignCatalog: {
      type: Object as PropType<CampaignCatalog>,
      required: true,
    },
    campaignProgress: {
      type: Object as PropType<CampaignProgress>,
      required: true,
    },
  },

  data() {
    const entry = this.campaignCatalog.level(this.level)

    if (!entry) {
      throw new RangeError('The campaign level is outside the catalog')
    }

    return {
      entry,
      confetti: new Confetti(),
    }
  },

  computed: {
    isCompleted(): boolean {
      return this.campaignProgress.isCompleted(this.level)
    },
  },

  methods: {
    toggleCompletion(): void {
      const completed = !this.isCompleted

      this.campaignProgress.setCompleted(this.level, completed)

      if (completed) {
        this.confetti.celebrate()
      }
    },
  },
})
</script>

<style lang="scss">
.trigma-level {
  &__content {
    @apply flex flex-1 flex-col items-center gap-6 px-6 pb-8;
  }

  &__difficulty {
    @apply self-start font-heading text-lg font-medium;
  }

  &__completion {
    @apply flex min-h-12 items-center justify-center rounded-lg border border-gray-300 bg-gray-100 px-6 py-3 font-medium;
    @apply w-full;

    &:hover {
      @apply bg-gray-200;
    }

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }

    @include dark {
      @apply border-gray-700 bg-gray-900;

      &:hover {
        @apply bg-gray-800;
      }
    }

    &--completed {
      @apply border-blue-600 bg-blue-100;

      @include dark {
        @apply border-blue-500 bg-blue-950;
      }
    }
  }

  &__next {
    @apply flex min-h-12 items-center justify-center self-stretch rounded-lg border border-gray-300 bg-gray-100 px-6 py-3 font-medium;

    &:hover {
      @apply bg-gray-200;
    }

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }

    @include dark {
      @apply border-gray-700 bg-gray-900;

      &:hover {
        @apply bg-gray-800;
      }
    }
  }
}
</style>
