<script setup lang="ts">
import { SummaryKey } from '~/types'

const summary = inject(SummaryKey) ?? []
</script>

<template>
    <archive-card title="归档" :summary="summary"></archive-card>
</template>