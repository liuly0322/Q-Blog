<script setup lang="ts">
import { PostSummary, SummaryKey } from '~/types'
const summary = inject(SummaryKey) as PostSummary[]
const props = defineProps<{ tag: string }>()
const curSummary = computed(() => summary.filter((post) => post.tags.includes(props.tag)))
</script>

<template>
  <archive-card :title="props.tag" :summary="curSummary"></archive-card>
</template>