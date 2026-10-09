<script setup lang="ts">
import AntDesignLeftCircleOutlined from '~icons/ant-design/left-outlined?width=18px&height=18px'
import AntDesignRightCircleOutlined from '~icons/ant-design/right-outlined?width=18px&height=18px'
import { homePagePath } from '~/utils/homePagination'

defineProps<{
  page: number
  pageMax: number
}>()
</script>

<template>
  <nav class="flex text-base" aria-label="文章分页">
    <RouterLink v-if="page > 1" :to="homePagePath(page - 1)" class="mx-1" aria-label="上一页">
      <AntDesignLeftCircleOutlined class="pt-1.5" />
    </RouterLink>
    <span v-else class="mx-1 cursor-not-allowed" aria-label="上一页" aria-disabled="true">
      <AntDesignLeftCircleOutlined class="pt-1.5" />
    </span>
    <RouterLink
      v-for="i in pageMax" :key="i"
      :to="homePagePath(i)"
      class="mx-1.5"
      :aria-current="i === page ? 'page' : undefined"
      :class="{ 'border-b border-accent text-accent': i === page }"
    >
      {{ i }}
    </RouterLink>
    <RouterLink v-if="page < pageMax" :to="homePagePath(page + 1)" class="mx-1" aria-label="下一页">
      <AntDesignRightCircleOutlined class="pt-1.5" />
    </RouterLink>
    <span v-else class="mx-1 cursor-not-allowed" aria-label="下一页" aria-disabled="true">
      <AntDesignRightCircleOutlined class="pt-1.5" />
    </span>
  </nav>
</template>
