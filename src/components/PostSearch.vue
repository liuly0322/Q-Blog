<template>
  <form class="w-full" role="search">
    <div class="group flex h-11 w-full items-center rounded-full border border-dashed border-accent bg-surface px-3 transition-colors focus-within:border-solid">
      <svg class="mr-2 size-5 shrink-0 text-muted group-focus-within:text-accent" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" stroke-width="2" />
        <path d="m16 16 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <input
        id="site-search"
        name="q"
        class="min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-wait disabled:opacity-50"
        type="text"
        inputmode="search"
        disabled
        readonly
        placeholder="搜索加载中..."
        autocomplete="off"
        aria-label="搜索文章"
        aria-haspopup="dialog"
        aria-controls="site-search-modal"
      >
    </div>
  </form>
</template>
