<script setup lang="ts">
import friends from '../../assets/friends.json'
</script>

<template>
  <n-divider title-placement="left">友情链接</n-divider>
  <div class="overflow-hidden flex flex-wrap">
    <a v-for="friend in friends" :key="friend.name" :href="friend.url" target="_blank" class="flex-auto text-left m-2.5">
      <n-card content-style="display: flex">
        <img :src="friend.avatar" :alt="friend.name" class="mr-3 rounded-full" height="48" width="48">
        <div class="flex flex-col">
          <b>{{ friend.name }}</b>
          {{ friend.introduction }}
        </div>
      </n-card>
    </a>
  </div>
</template>
