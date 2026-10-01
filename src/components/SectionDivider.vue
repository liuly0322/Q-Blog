<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="section-divider flex items-center text-base text-gray-700 dark:text-gray-200">
    <span class="section-divider-line" aria-hidden="true" />
    <span class="section-divider-title">{{ title }}</span>
    <span class="section-divider-line flex-auto" aria-hidden="true" />
  </div>
</template>

<style scoped>
.section-divider {
  gap: 12px;
  margin: 26px 0;
  line-height: 20px;
}

.section-divider-line {
  height: 1px;
  background-color: rgba(107, 114, 128, 0.2);
}

.section-divider-line:first-child {
  flex: 0 0 24px;
}

html.dark .section-divider-line {
  background-color: rgba(255, 255, 255, 0.12);
}
</style>
