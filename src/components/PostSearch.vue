<script setup lang="ts">
const searchPattern = ref('')

function handleSearch() {
  const keyword = searchPattern.value.trim()
  if (!keyword)
    return

  const searchUrl = new URL('https://www.google.com/search')
  searchUrl.searchParams.set('q', `site:${window.location.hostname} ${keyword}`)
  window.open(searchUrl.toString(), '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <form class="w-full" @submit.prevent="handleSearch">
    <div class="group flex h-11 w-full items-center rounded-full border border-dashed border-hex-42b883 bg-white px-3 transition-colors focus-within:border-solid dark:bg-hex-1e1e1e">
      <svg class="mr-2 h-5 w-5 shrink-0 text-hex-42b883" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" stroke-width="2" />
        <path d="m16 16 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <input
        id="site-search"
        v-model="searchPattern"
        name="q"
        class="min-w-0 flex-1 bg-transparent px-0 text-sm text-gray-700 outline-none dark:text-gray-200"
        type="text"
        inputmode="search"
        placeholder="搜索..."
        autocomplete="off"
        aria-label="搜索文章"
      >
    </div>
  </form>
</template>
