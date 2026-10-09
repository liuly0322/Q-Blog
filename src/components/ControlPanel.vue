<script setup lang="ts">
const { summary, tagCount } = useSummary()
const { toggleDark } = useDarks()
</script>

<template>
  <div class="mb-6 text-center lg:card p-6">
    <div class="flex justify-center mb-2">
      <img
        src="/avatar_192.webp"
        alt="liuly"
        class="rounded-full"
        height="100"
        width="100"
      >
    </div>
    <p class="text-xl">lly | undef_baka</p>
    <p class="mt-2 mb-6">愛の形骸<br>追う絵 覆う手を</p>
    <div class="flex text-base justify-around mb-4">
      <router-link to="/archive" class="flex flex-col items-center hover:text-accent">
        <p class="text-xs leading-none">
          POSTS
        </p>
        <p>{{ summary.length }}</p>
      </router-link>
      <router-link to="/tags" class="flex flex-col items-center hover:text-accent">
        <p class="text-xs leading-none">
          TAGS
        </p>
        <p>{{ tagCount.length }}</p>
      </router-link>
    </div>
    <PostSearch class="mb-6" />
    <div class="flex justify-center my-2">
      <button aria-label="toggle-dark-mode" @click="toggleDark()">
        <i-carbon:haze-night class="text-2xl hidden dark:block" />
        <i-carbon:sun class="text-2xl dark:hidden" />
      </button>
      <a aria-label="source-code" class="mx-2 hover:text-accent" href="https://github.com/liuly0322/Q-Blog" target="_blank">
        <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" class="text-2xl">
          <path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C15.9 5 17 5.3 17 5.3c.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
        </svg>
      </a>
      <a aria-label="feed-xml" class="hover:text-accent" href="/feed.xml" target="_blank">
        <i-carbon:rss class="text-2xl" />
      </a>
    </div>
  </div>
</template>
