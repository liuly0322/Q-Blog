<template>
  <div style="overflow: auto">
    <div v-html="renderedHTML" class="md-blog m-auto text-left"></div>
  </div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt()
const renderedHTML = computed(() => md.render(props.source))

const props = defineProps({
  source: {
    type: String,
    required: true
  }
})
</script>
