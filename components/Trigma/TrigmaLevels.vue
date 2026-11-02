<template>
  <PageHeader
    :title="$t('levels')"
    back-href="/trigma"
    :back-label="$t('returnToMenu')"
  />

  <main class="trigma-levels__content">
    <section
      v-for="group in difficultyGroups"
      :key="group.difficulty"
      ref="difficultySections"
      class="trigma-levels__group"
      :data-difficulty="group.difficulty"
    >
      <header class="trigma-levels__group-header">
        <component
          :is="difficultyIcon(group.difficulty)"
          class="trigma-levels__group-icon"
          aria-hidden="true"
        />
        <h2 class="trigma-levels__group-title">{{ difficultyName(group.difficulty) }}</h2>
        <span class="trigma-levels__group-count">{{ group.completedCount }}/{{ group.levels.length }}</span>
      </header>

      <div
        class="trigma-levels__progress"
        role="progressbar"
        :aria-label="difficultyName(group.difficulty)"
        aria-valuemin="0"
        :aria-valuemax="group.levels.length"
        :aria-valuenow="group.completedCount"
      >
        <span
          class="trigma-levels__progress-indicator"
          :style="{ width: `${(group.completedCount / group.levels.length) * 100}%` }"
        />
      </div>

      <div class="trigma-levels__grid">
        <a
          v-for="entry in group.levels"
          :key="entry.level"
          :class="{
            'trigma-levels__level': true,
            'trigma-levels__level--completed': campaignProgress.isCompleted(entry.level),
          }"
          :href="`/trigma/levels/${entry.level.toString()}`"
          :aria-label="levelLabel(entry.level)"
        >
          {{ entry.level }}
          <span
            v-if="campaignProgress.isCompleted(entry.level)"
            class="trigma-levels__completion"
            aria-hidden="true"
          >
            ✓
          </span>
        </a>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from 'vue'
import PageHeader from '@/components/Shared/Layout/PageHeader.vue'
import DifficultyInitiateIcon from '@/components/Shared/Icons/DifficultyInitiateIcon.vue'
import DifficultyApprenticeIcon from '@/components/Shared/Icons/DifficultyApprenticeIcon.vue'
import DifficultyAdeptIcon from '@/components/Shared/Icons/DifficultyAdeptIcon.vue'
import DifficultyMasterIcon from '@/components/Shared/Icons/DifficultyMasterIcon.vue'
import DifficultyVirtuosoIcon from '@/components/Shared/Icons/DifficultyVirtuosoIcon.vue'
import { CampaignCatalog } from '@/lib/Trigma/CampaignCatalog'
import { CampaignDifficulty } from '@/lib/Shared/CampaignDifficulty'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'

const difficultyIcons: Record<CampaignDifficulty, Component> = {
  [CampaignDifficulty.Initiate]: DifficultyInitiateIcon,
  [CampaignDifficulty.Apprentice]: DifficultyApprenticeIcon,
  [CampaignDifficulty.Adept]: DifficultyAdeptIcon,
  [CampaignDifficulty.Master]: DifficultyMasterIcon,
  [CampaignDifficulty.Virtuoso]: DifficultyVirtuosoIcon,
}

export default defineComponent({
  components: {
    PageHeader,
    DifficultyInitiateIcon,
    DifficultyApprenticeIcon,
    DifficultyAdeptIcon,
    DifficultyMasterIcon,
    DifficultyVirtuosoIcon,
  },

  props: {
    campaignCatalog: {
      type: Object as PropType<CampaignCatalog>,
      required: true,
    },
    campaignProgress: {
      type: Object as PropType<CampaignProgress>,
      required: true,
    },
  },

  computed: {
    difficultyGroups() {
      return Object.values(CampaignDifficulty).map((difficulty) => {
        const levels = this.campaignCatalog.levels().filter((entry) => entry.difficulty === difficulty)

        return {
          difficulty,
          levels,
          completedCount: levels.filter((entry) => this.campaignProgress.isCompleted(entry.level)).length,
        }
      })
    },
  },

  mounted() {
    void this.$nextTick(() => {
      const firstPendingGroup = this.difficultyGroups.findIndex((group) => group.completedCount < group.levels.length)

      if (firstPendingGroup === -1) {
        window.scrollTo(0, 0)

        return
      }

      const sections = this.$refs.difficultySections as HTMLElement[]
      const section = sections[firstPendingGroup]

      if (section instanceof HTMLElement && typeof section.scrollIntoView === 'function') {
        section.scrollIntoView({ block: 'start' })
      }
    })
  },

  methods: {
    difficultyIcon(difficulty: CampaignDifficulty): Component {
      return difficultyIcons[difficulty]
    },

    difficultyName(difficulty: CampaignDifficulty): string {
      return this.$t(difficulty)
    },

    levelLabel(level: number): string {
      const message = this.campaignProgress.isCompleted(level) ? 'campaignLevelCompleted' : 'campaignLevelPending'

      return this.$t(message, { level })
    },
  },
})
</script>

<style lang="scss">
.trigma-levels {
  &__content {
    @apply flex flex-1 flex-col gap-8 px-6 pb-8;
  }

  &__group {
    @apply flex flex-col gap-4;
  }

  &__group-header {
    @apply flex items-center gap-3;
  }

  &__group-icon {
    @apply h-5 w-5 shrink-0;
  }

  &__group-title {
    @apply flex-1 font-heading text-xl font-semibold;
  }

  &__group-count {
    @apply text-sm tabular-nums text-gray-600;

    @include dark {
      @apply text-gray-400;
    }
  }

  &__progress {
    @apply h-2 overflow-hidden rounded-full bg-gray-300;

    @include dark {
      @apply bg-gray-700;
    }
  }

  &__progress-indicator {
    @apply block h-full rounded-full bg-blue-600;
  }

  &__grid {
    @apply grid grid-cols-5 gap-2;
  }

  &__level {
    @apply relative flex aspect-square items-center justify-center rounded-lg border border-gray-300 bg-gray-100 font-heading font-medium tabular-nums;

    &:hover {
      @apply bg-gray-200;
    }

    &:focus-visible {
      @apply z-10 outline outline-2 outline-offset-2 outline-blue-600;
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

  &__completion {
    @apply absolute right-1 top-0 text-xs font-bold text-blue-700;

    @include dark {
      @apply text-blue-300;
    }
  }
}
</style>
