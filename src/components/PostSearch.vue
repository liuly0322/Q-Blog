<template>
  <button
    id="site-search" disabled
    class="group flex w-full cursor-pointer items-center rounded-full border border-dashed border-accent bg-surface px-3 py-2 text-muted transition-colors focus:border-solid disabled:cursor-wait disabled:opacity-50"
    aria-label="搜索文章" aria-haspopup="dialog" aria-controls="site-search-modal"
  >
    <svg
      class="mr-2 size-5 shrink-0 group-focus:text-accent"
      viewBox="0 0 24 24" fill="none" aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" stroke-width="2" />
      <path d="m16 16 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <span data-search-label>搜索加载中...</span>
  </button>
</template>
