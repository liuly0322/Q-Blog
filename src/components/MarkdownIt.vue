<script setup lang="ts">
// now it only deliver content to raw html
const renderedHTML = computed(() => props.source)

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div style="overflow: auto">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="md-blog m-auto text-left" v-html="renderedHTML"></div>
  </div>
</template>
