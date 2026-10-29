<template>
  <PageHeader
    :title="$t('options')"
    back-href="/trigma"
    :back-label="$t('returnToMenu')"
  />

  <main class="trigma-options__content">
    <SelectField
      id="theme"
      :label="$t('theme')"
      :options="themes"
      :model-value="preferences.theme"
      @update:model-value="setTheme"
    >
      <template #option="{ value }">
        <span class="trigma-options__theme-option">
          <component
            :is="themeIcon(value)"
            class="trigma-options__theme-icon"
            aria-hidden="true"
          />
          {{ themeLabel(value) }}
        </span>
      </template>
    </SelectField>

    <SelectField
      id="language"
      :label="$t('language')"
      :options="languages"
      :model-value="preferences.language"
      @update:model-value="setLanguage"
    >
      <template #option="{ value }">
        {{ languageLabel(value) }}
      </template>
    </SelectField>

    <a
      class="trigma-options__catalog"
      href="/"
      >{{ $t('allPuzzles') }}</a
    >
  </main>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from 'vue'
import PageHeader from '@/components/Shared/Layout/PageHeader.vue'
import SelectField from '@/components/Shared/Forms/SelectField.vue'
import ThemeAutoIcon from '@/components/Shared/Icons/ThemeAutoIcon.vue'
import ThemeDarkIcon from '@/components/Shared/Icons/ThemeDarkIcon.vue'
import ThemeLightIcon from '@/components/Shared/Icons/ThemeLightIcon.vue'
import { Preferences } from '@/lib/Shared/Preferences/Preferences'
import { Language } from '@/lib/Shared/Preferences/Language'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'

const themeIcons: Record<string, Component> = {
  [ThemeMode.Auto]: ThemeAutoIcon,
  [ThemeMode.Light]: ThemeLightIcon,
  [ThemeMode.Dark]: ThemeDarkIcon,
}

export default defineComponent({
  components: {
    PageHeader,
    SelectField,
    ThemeAutoIcon,
    ThemeDarkIcon,
    ThemeLightIcon,
  },

  props: {
    preferences: {
      type: Object as PropType<Preferences>,
      required: true,
    },
  },

  computed: {
    themes() {
      return Object.values(ThemeMode)
    },

    languages() {
      return Object.values(Language)
    },
  },

  methods: {
    themeIcon(value: string): Component {
      return themeIcons[value]
    },

    themeLabel(value: string): string {
      const labels: Record<string, string> = {
        [ThemeMode.Auto]: this.$t('automatic'),
        [ThemeMode.Light]: this.$t('light'),
        [ThemeMode.Dark]: this.$t('dark'),
      }

      return labels[value] ?? value
    },

    languageLabel(value: Language): string {
      return this.$t('locale', {}, { locale: value })
    },

    setTheme(value: string) {
      const theme = Object.values(ThemeMode).find((theme: string) => theme === value)

      if (theme) {
        this.preferences.setTheme(theme)
      }
    },

    setLanguage(value: string) {
      const language = Object.values(Language).find((language: string) => language === value)

      if (language) {
        this.preferences.setLanguage(language)
      }
    },
  },
})
</script>

<style lang="scss">
.trigma-options {
  &__content {
    @apply flex flex-1 flex-col gap-6 px-6 pb-8;
  }

  &__theme-option {
    @apply inline-flex items-center gap-2;
  }

  &__theme-icon {
    @apply h-5 w-5 shrink-0;
  }

  &__catalog {
    @apply mt-4 self-start rounded py-2 underline underline-offset-4;

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }
  }
}
</style>
