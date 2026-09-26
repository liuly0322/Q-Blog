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
    class="blog-tag"
    :class="`blog-tag--${size}`"
  >
    <span class="blog-tag__content"><slot /></span>
  </div>
</template>

<style scoped>
.blog-tag {
  --blog-tag-font-size: 14px;
  --blog-tag-height: 28px;
  --blog-tag-border: rgb(32 128 240 / 30%);
  --blog-tag-color: rgb(32 128 240 / 10%);
  --blog-tag-text-color: #2080f0;

  border-radius: calc(var(--blog-tag-height) / 2);
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  height: var(--blog-tag-height);
  padding: 0 calc(var(--blog-tag-height) / 3);
  color: var(--blog-tag-text-color);
  background-color: var(--blog-tag-color);
  font-size: var(--blog-tag-font-size);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 0.3s cubic-bezier(.4, 0, .2, 1),
    background-color 0.3s cubic-bezier(.4, 0, .2, 1),
    color 0.3s cubic-bezier(.4, 0, .2, 1);
}

.blog-tag::after {
  position: absolute;
  inset: 0;
  border: 1px solid var(--blog-tag-border);
  border-radius: inherit;
  pointer-events: none;
  content: '';
  transition: border-color 0.3s cubic-bezier(.4, 0, .2, 1);
}

.blog-tag--small {
  --blog-tag-font-size: 12px;
  --blog-tag-height: 22px;
}

.blog-tag--large {
  --blog-tag-height: 34px;
}

html.dark .blog-tag {
  --blog-tag-border: rgb(112 192 232 / 30%);
  --blog-tag-color: #00000000;
  --blog-tag-text-color: #70c0e8;
}
</style>
