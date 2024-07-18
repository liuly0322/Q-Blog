<script setup lang="ts">
const APlayer = defineAsyncComponent(() => import('./APlayer.vue'))
</script>

<template>
  <div class="pt-6 px-2">
    <div class="sticky top-22 w-[256px]">
      <ControlPanel />
      <Suspense>
        <APlayer song-server="netease" song-id="373425292" />
      </Suspense>
    </div>
  </div>
</template>
