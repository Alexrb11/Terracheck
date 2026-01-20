<template>
  <div class="app-layout">
    <RouterView />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background-color: var(--surface-ground);
  color: var(--text-main);
}
</style>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
