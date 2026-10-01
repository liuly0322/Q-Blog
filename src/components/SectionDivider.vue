<template>
  <div class="section-divider flex items-center text-base">
    <span class="section-divider-line" aria-hidden="true" />
    <div class="section-divider-title"><slot /></div>
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
  background-color: var(--border);
}

.section-divider-line:first-child {
  flex: 0 0 24px;
}
</style>
