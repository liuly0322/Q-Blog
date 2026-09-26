<script setup lang="ts">
const { summary, tagCount } = useSummary()
const { toggleDark } = useDarks()
</script>

<template>
  <div class="mx-1 mt-0 mb-6 text-center lg:card p-4">
    <div class="flex justify-center mb-2">
      <img
        src="/avatar_192.webp"
        alt="liuly"
        class="rounded-full cursor-pointer"
        height="100"
        width="100"
      >
    </div>
    <p class="text-xl">lly | undef_baka</p>
    <p class="mt-2 mb-6">愛の形骸<br>追う絵 覆う手を</p>
    <div class="flex justify-around my-4">
      <router-link to="/archive" class="flex flex-col items-center hover:text-hex-42b883">
        <p class="text-[11px]">
          POSTS
        </p>
        <p>{{ summary.length }}</p>
      </router-link>
      <router-link to="/tags" class="flex flex-col items-center hover:text-hex-42b883">
        <p class="text-[11px]">
          TAGS
        </p>
        <p>{{ tagCount.length }}</p>
      </router-link>
    </div>
    <PostSearch class="px-4 pb-4" />
    <span class="m-0.5 inline-block" @click="toggleDark()">
      <i-carbon:haze-night class="text-2xl hidden dark:block" />
      <i-carbon:sun class="text-2xl dark:hidden" />
    </span>
    <a aria-label="source-code" class="m-0.5 inline-block hover:text-hex-42b883" href="https://github.com/liuly0322/Q-Blog" target="_blank">
      <i-ant-design:github-filled class="text-2xl" />
    </a>
    <a aria-label="feed-xml" class="m-0.5 inline-block hover:text-hex-42b883" href="/feed.xml" target="_blank">
      <i-carbon:rss class="text-2xl" />
    </a>
  </div>
</template>
