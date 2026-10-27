<template>
  <House v-bind="$attrs" />
</template>

<script lang="ts">
import { House } from '@lucide/vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    House,
  },
  inheritAttrs: false,
})
</script>
