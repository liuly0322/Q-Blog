<script setup lang="ts">
const friends = useFetch('/friends.json').json().data
</script>

<template>
  <n-divider title-placement="left">
    友情链接
  </n-divider>
  <div class="overflow-hidden flex flex-wrap">
    <a v-for="friend in friends" :key="friend.name" :href="friend.url" target="_blank" class="flex-auto text-left m-2.5 flex rounded-lg shadow-md custom-card p-4">
      <img :src="friend.avatar" :alt="friend.name" class="mr-3 rounded-full" height="48" width="48">
      <div class="flex flex-col">
        <b>{{ friend.name }}</b>
        {{ friend.introduction }}
      </div>
    </a>
  </div>
</template>
