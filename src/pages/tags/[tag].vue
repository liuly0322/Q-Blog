<script setup lang="ts">
const summary = useSummary()
const props = defineProps<{ tag: string }>()
const curSummary = computed(() => summary.filter((post) => post.tags.includes(props.tag)))
</script>

<template>
  <archive-card :title="props.tag" :summary="curSummary"></archive-card>
</template>