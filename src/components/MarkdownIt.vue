<script setup lang="ts">
// now it only deliver content to raw html
const renderedHTML = computed(() => props.source)

const props = defineProps({
  source: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div style="overflow: auto">
    <div v-html="renderedHTML" class="md-blog m-auto text-left"></div>
  </div>
</template>

