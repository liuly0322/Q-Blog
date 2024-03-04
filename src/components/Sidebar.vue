<script setup lang="ts">
const APlayer = defineAsyncComponent(() => import('./APlayer.vue'))

const { isMobile } = usePhone()
const { mobileNavigation } = useSiteNavigation()
const { enableToc } = useToc()
</script>

<template>
  <div>
    <div v-if="isMobile" key="nav" class="flex flex-wrap card p-4 mb-6 mx-1.25">
      <router-link v-for="(v, k, i) in mobileNavigation" :key="i" class="mx-3 my-1" :to="v">
        {{ k }}
      </router-link>
    </div>
    <div v-if="!isMobile">
      <Toc v-show="enableToc" key="toc" />
      <Hitokoto v-show="!enableToc" key="hitokoto" />
    </div>
    <APlayer key="aplayer" song-server="netease" song-id="373425292" />
    <ControlPanel key="panel" />
  </div>
</template>
