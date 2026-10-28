<template>
  <Settings v-bind="$attrs" />
</template>

<script lang="ts">
import { Settings } from '@lucide/vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: { Settings },
  inheritAttrs: false,
})
</script>
