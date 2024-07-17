<script setup lang="ts">
const APlayer = defineAsyncComponent(() => import('./APlayer.vue'))

const { isMobile } = usePhone()
const { enableToc } = useToc()
</script>

<template>
  <div>
    <Toc v-if="!isMobile" v-show="enableToc" />
    <ControlPanel v-show="isMobile || !enableToc" />
    <Suspense>
      <APlayer song-server="netease" song-id="373425292" />
    </Suspense>
  </div>
</template>
