<template>
  <n-card title="友情链接">
    <template #cover>
      <img src="/link-banner.jpg" />
    </template>
    <div class="friend-container">
      <template v-for="friend in friends" :key="friend.name">
        <a :href="friend.url" target="_blank" class="friend">
          <n-card content-style="display:flex">
            <n-avatar round :size="48" :src="friend.avatar" class="avatar" />
            <div class="flex" style="flex-direction: column;">
              <b>{{ friend.name }}</b>
              {{ friend.introduction }}
            </div>
          </n-card>
        </a>
      </template>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import friends from '../../assets/friends.json'
</script>

<style scoped>
.friend-container {
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
}

.friend {
  margin: 10px;
  text-align: left;
  flex: 1 1 content;
  min-width: 200px;
}

.avatar {
  margin-right: 12px;
}
</style>
