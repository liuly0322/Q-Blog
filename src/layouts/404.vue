<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <main text="center teal-700 dark:gray-200">
    <router-view />
    <div>
      <n-button m="3 t8" @click="router.back()">
        返回
      </n-button>
    </div>
  </main>
</template>

<style scoped>
main {
  margin-top: 200px;
}
</style>