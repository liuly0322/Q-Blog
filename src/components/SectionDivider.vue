<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="section-divider">
    <span class="section-divider-line" aria-hidden="true" />
    <span class="section-divider-title">{{ title }}</span>
    <span class="section-divider-line section-divider-line-grow" aria-hidden="true" />
  </div>
</template>

<style scoped>
.section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 26px 0;
  color: #374151;
  font-size: 16px;
  line-height: 20px;
}

.section-divider-line {
  flex: 0 0 24px;
  height: 1px;
  background-color: rgba(107, 114, 128, 0.2);
}

.section-divider-line-grow {
  flex: 1 1 auto;
}

html.dark .section-divider {
  color: #e5e7eb;
}

html.dark .section-divider-line {
  background-color: rgba(255, 255, 255, 0.12);
}
</style>
