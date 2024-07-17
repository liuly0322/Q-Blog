<script setup lang="ts">
const APlayer = defineAsyncComponent(() => import('./APlayer.vue'))

const { isMobile } = usePhone()
const { enableToc } = useToc()
</script>

<template>
  <div>
    <ControlPanel />
    <div v-if="!isMobile">
      <Toc v-show="enableToc" />
    </div>
    <Suspense>
      <APlayer song-server="netease" song-id="373425292" />
    </Suspense>
  </div>
</template>
