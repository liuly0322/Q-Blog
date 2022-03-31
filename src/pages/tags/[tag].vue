<script setup lang="ts">
import { SummaryKey } from '~/types'
const summary = inject(SummaryKey) ?? []
const props = defineProps<{ tag: string }>()
const curSummary = computed(() => summary.filter((post) => post.tags.includes(props.tag)))
</script>

<template>
  <archive-card :title="props.tag" :summary="curSummary"></archive-card>
</template>