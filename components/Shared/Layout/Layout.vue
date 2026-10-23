<template>
  <div v-if="frontmatter.home" class="layout">
    <h1 class="layout__title">{{ site.title }}</h1>
    <p>{{ site.description }}</p>
    <ul>
      <li><a href="/markdown-examples.html">Markdown Examples</a></li>
      <li><a href="/api-examples.html">API Examples</a></li>
    </ul>
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
  name: 'Layout',
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
    @apply text-gray-700 text-3xl font-bold;
  }
}
</style>