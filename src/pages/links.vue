<template>
  <n-card mt-10 title="友情链接">
    <template #cover>
      <img src="/link-banner.jpg">
    </template>
    <div class="friend-container">
      <template v-for="friend in friends" :key="friend.name">
        <a :href="friend.url" target="_blank" class="friend">
          <n-card>
            <n-avatar
              round
              :size="48"
              :src="friend.avatar"
              class="avatar"
            />
            <b>{{ friend.name }}</b>
            <br>
            {{ friend.introduction }}
          </n-card>
        </a>
      </template>
    </div>
  </n-card>
</template>

<script setup lang="ts">
interface Friend {
  name: string
  avatar: string
  introduction?: string
  url: string
}

const friends = ref([] as Friend[])
const links_url = '/friends.json'

const get_links = async() => {
  const { data } = await useFetch(links_url).get().json()
  friends.value = data.value
}

onMounted(get_links)
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
  float: left;
  margin-right: 12px;
}
</style>
