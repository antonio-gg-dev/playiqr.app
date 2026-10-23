<template>
  <div
    v-if="frontmatter.home"
    class="layout"
  >
    <h1 class="layout__title">{{ site.title }}</h1>
    <p>{{ site.description }}</p>
  </div>
  <div v-else>
    <a href="/">Home</a>
    <Content />
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
.layout {
  &__title {
    @apply text-3xl font-bold text-gray-700;
  }
}
</style>
