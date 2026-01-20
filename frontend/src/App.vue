<template>
  <div class="app-layout">
    <RouterView />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text-main);
}
</style>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
