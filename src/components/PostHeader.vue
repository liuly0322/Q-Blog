<script setup lang="ts">
import { PostSummary } from '~/composables/useSummary';
const props = defineProps<{
  currPost: PostSummary
}>()

</script>

<template>
  <div class="md-blog m-auto text-left">
    <h1>{{ currPost.title }}</h1>
    <p>{{ currPost.date }}</p>
    <div class="my-2 border-b pb-4">
      <n-tag v-for="tag in currPost.tags" :key="tag" class="mr-2" type="success" round>
        <router-link :to="`/tags/${encodeURIComponent(tag)}`">{{ tag }}</router-link>
      </n-tag>
    </div>
  </div>

</template>
