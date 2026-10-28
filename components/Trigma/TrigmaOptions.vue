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
    />

    <SelectField
      id="language"
      :label="$t('language')"
      :options="languages"
      :model-value="preferences.language"
      @update:model-value="setLanguage"
    />

    <a
      class="trigma-options__catalog"
      href="/"
      >{{ $t('allPuzzles') }}</a
    >
  </main>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import PageHeader from '@/components/Shared/Layout/PageHeader.vue'
import SelectField from '@/components/Shared/Forms/SelectField.vue'
import { Preferences } from '@/lib/Shared/Preferences/Preferences'
import { Language } from '@/lib/Shared/Preferences/Language'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'

export default defineComponent({
  components: {
    PageHeader,
    SelectField,
  },

  props: {
    preferences: {
      type: Object as PropType<Preferences>,
      required: true,
    },
  },

  computed: {
    themes() {
      return [
        {
          value: ThemeMode.Auto,
          label: this.$t('automatic'),
        },
        {
          value: ThemeMode.Light,
          label: this.$t('light'),
        },
        {
          value: ThemeMode.Dark,
          label: this.$t('dark'),
        },
      ]
    },

    languages() {
      return [
        {
          value: Language.Spanish,
          label: this.$t('spanish'),
        },
        {
          value: Language.English,
          label: this.$t('english'),
        },
      ]
    },
  },

  methods: {
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

  &__catalog {
    @apply mt-4 self-start rounded py-2 underline underline-offset-4;

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }
  }
}
</style>
