<template>
  <div class="base-layout__container">
    <Content />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
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
}
</style>
