<script setup lang="ts">
const props = defineProps<{ tag: string }>()
const { summary } = useSummary()
const tagPosts = computed(() =>
  summary.filter(post => post.tags.includes(props.tag)),
)
</script>

<template>
  <SectionDivider>{{ props.tag }}</SectionDivider>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-for="post in tagPosts" :key="post.url"
      class="card p-4 flex flex-col justify-between"
    >
      <h2 class="font-medium text-base mb-4 mt-2">
        <router-link
          :to="`/posts/${encodeURIComponent(post.url)}`"
          class="transition-colors hover:text-accent"
        >
          {{ post.title }}
        </router-link>
      </h2>
      <div class="text-xs text-muted">
        {{ post.date }}
      </div>
      <div class="mt-2">
        <router-link
          v-for="postTag in post.tags" :key="postTag" :to="`/tags/${postTag}`"
          class="blog-tag h-5.5 px-1.5 text-xs m-1"
        >
          {{ postTag }}
        </router-link>
      </div>
    </div>
  </div>
</template>
