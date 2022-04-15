<script setup lang="ts">
const summary = useSummary()
const props = defineProps<{
  currPost: string
}>()
const curIndex = computed(() => summary.value.findIndex((PostSummary) => PostSummary.url == props.currPost))

</script>

<template>
  <div class="overflow-hidden my-12 p-4 border-t border-b">
    <div class="float-left" v-if="curIndex > 0">
      <router-link :to="`/posts/${encodeURIComponent(summary[curIndex - 1].url)}`">
        上一篇：{{ summary[curIndex - 1].title }}
      </router-link>
    </div>
    <div class="float-right" v-if="curIndex + 1 < summary.length">
      <router-link :to="`/posts/${encodeURIComponent(summary[curIndex + 1].url)}`">下一篇：{{ summary[curIndex + 1].title }}
      </router-link>
    </div>
  </div>

</template>
