<script setup lang="ts">
type BlogTagSize = 'small' | 'medium' | 'large'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  size?: BlogTagSize
}>(), {
  size: 'medium',
})
</script>

<template>
  <div
    v-bind="$attrs"
    class="blog-tag box-border inline-flex items-center leading-none cursor-pointer"
    :class="`blog-tag--${size}`"
  >
    <span class="blog-tag__content"><slot /></span>
  </div>
</template>

<style scoped>
.blog-tag {
  --blog-tag-font-size: 14px;
  --blog-tag-height: 28px;

  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: calc(var(--blog-tag-height) / 2);
  flex-wrap: nowrap;
  height: var(--blog-tag-height);
  padding: 0 calc(var(--blog-tag-height) / 3 - 1px);
  color: var(--accent);
  background-color: color-mix(in srgb, var(--accent) 5%, transparent);
  font-size: var(--blog-tag-font-size);
  white-space: nowrap;
}

.blog-tag:hover {
  background-color: color-mix(in srgb, var(--accent) 10%, transparent);
}

.blog-tag--small {
  --blog-tag-font-size: 12px;
  --blog-tag-height: 22px;
}

.blog-tag--large {
  --blog-tag-height: 34px;
}
</style>
