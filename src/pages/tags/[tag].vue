<script setup lang="ts">
const props = defineProps<{ tag: string }>()
const { summary } = useSummary()
const curSummary = computed(() =>
  summary.filter(post => post.tags.includes(props.tag)),
)
</script>

<template>
  <ArchiveCard :title="props.tag" :summary="curSummary" />
</template>
