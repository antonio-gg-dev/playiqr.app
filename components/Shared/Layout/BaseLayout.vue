<template>
  <div class="base-layout">
    <div class="base-layout__container">
      <header class="base-layout__header"></header>
      <main class="base-layout__content">
        <template v-if="frontmatter.home">
          <h1 class="base-layout__title">{{ site.title }}</h1>
          <p>{{ site.description }}</p>
        </template>
        <template v-else>
          <a href="/">Home</a>
          <Content />
        </template>
      </main>
      <footer class="base-layout__actions"></footer>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useData } from 'vitepress'

export default defineComponent({
  setup() {
    const { site, frontmatter } = useData()

    return {
      site,
      frontmatter,
    }
  },
})
</script>

<style lang="scss">
.base-layout {
  &__container {
    @apply mx-auto flex w-full flex-col;
    padding-top: env(safe-area-inset-top, 0px);
    padding-right: env(safe-area-inset-right, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    padding-left: env(safe-area-inset-left, 0px);
    max-width: calc(100dvh * 3 / 4);
    min-height: 100dvh;
  }

  &__content {
    @apply flex-1;
  }

  &__title {
    @apply font-heading text-3xl font-bold text-gray-700;
  }
}
</style>
