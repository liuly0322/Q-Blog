<script setup lang="ts">
const APlayer = defineAsyncComponent(() => import('./APlayer.vue'))
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <div>
    <ControlPanel />
    <Suspense v-if="mounted">
      <APlayer song-server="netease" song-id="373425292" />
    </Suspense>
  </div>
</template>
