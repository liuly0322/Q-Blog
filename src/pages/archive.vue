<script setup lang="ts">
import { PostSummary, SummaryKey } from '~/types'

const summary = inject(SummaryKey) as PostSummary[]
</script>

<template>
    <archive-card title="归档" :summary="summary"></archive-card>
</template>