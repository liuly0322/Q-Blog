<script setup lang="ts">
const { data } = useFetch('https://v1.hitokoto.cn').json()
</script>

<template>
  <div v-if="data?.hitokoto" class="mb-6 mx-1.25 card p-6">
    <h2 class="font-medium text-lg mb-4">
      一言
    </h2>
    <span>{{ data?.hitokoto }}</span>
    <div class="text-right pt-3.5">
      <span>—— {{ data?.from_who }}「{{ data?.from }}」</span>
    </div>
  </div>
</template>
