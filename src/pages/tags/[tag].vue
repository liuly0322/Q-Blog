<script setup lang="ts">
const summary = useSummary()
const props = defineProps<{ tag: string }>()
const curSummary = computed(() => summary.filter((post) => post.tags.includes(props.tag)))
</script>

<template>
  <ArchiveCard :title="props.tag" :summary="curSummary" />
</template>