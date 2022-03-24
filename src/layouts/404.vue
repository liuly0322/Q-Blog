<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <main p="x4 y10" text="center teal-700 dark:gray-200">
    <router-view />
    <div>
      <n-button m="3 t8" @click="router.back()">
        返回
      </n-button>
    </div>
  </main>
</template>

<style scoped>
.no-rules-in-this-file {
  display: block;
}
</style>
