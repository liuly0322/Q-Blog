---
title: Anime List!
date: 2024-02-23 22:43:15
tags: [杂谈, anime]
category: web
---

想做 Anime List 很久了，之前也考虑过 Notion 的方案，但是本人平常也不用 Notion，不想为了这个事情多用一个平台。最近发现自己使用的 [bangumi](https://bgm.tv) 有 API，于是就想到了用它来做 Anime List。

<!-- more -->

目前在博客导航栏选择动画即可进入 Anime List 页面。

![Anime List](bangumi_anime_list/my_anime_list.png)

编码过程得到了 windicss 这一原子 CSS 框架和 Copilot 的大力帮助。

## Copilot

你可以直接往代码里粘贴 [bangumi 接口](https://bangumi.github.io/api/) 的返回数据示例，然后敲一个 `interface Anime`，后面就是 Copilot 发挥了。

```typescript
interface Anime {
  updated_at: string
  comment: string
  tags: { name: string; count: number }[]
  subject: {
    date: string
    images: {
      small: string
      grid: string
      large: string
      medium: string
      common: string
    }
    name: string
    name_cn: string
    short_summary: string
    tags: { name: string; count: number }[]
    score: number
    type: number
    id: number
    eps: number
    volumes: number
    collection_total: number
    rank: number
  }
  subject_id: number
  vol_status: number
  ep_status: number
  subject_type: number
  type: number
  rate: number
  private: boolean
}
```

## windicss

```html
<n-card
    v-for="anime in animeList"
    :key="anime.subject.id"
    content-style="display:flex;flex-direction:column;justify-content:space-between"
    style="height:100%"
>
    <div class="mb-4">
    <img
        :src="anime.subject.images.medium"
        :alt="anime.subject.name"
        class="rounded-lg"
    >
    <div class="mt-2">
        <p class="text-lg font-bold">
        {{ anime.subject.name_cn || anime.subject.name }}
        </p>
        <p class="text-sm text-gray-500 mt-4 whitespace-pre-line">
        {{ anime.subject.short_summary }}……
        </p>
    </div>
    </div>
    <hr>
    <div class="mt-2">
    <p v-if="anime.comment" class="mt-2 text-sm">
        {{ anime.comment }}
    </p>
    <div class="text-sm mt-4 flex justify-center">
        <n-rate :default-value="anime.rate / 2" readonly allow-half />
        <span class="text-gray-500 ml-2 text-xs mt-1">
        {{ timeToDate(anime.updated_at) }}
        </span>
    </div>
    </div>
</n-card>
```

写个样式非常方便，而且也可以 Copilot 生成类名（

## 分页

bangumi 的这个 API 是分页的，出于性能考虑可以写一个滚动加载。

```typescript
const animeList = ref([] as Anime[])

const loading = ref(true)
const pageSize = 12
let page = 0

const fetchAnimeList = async () => {
  if (!loading.value) return
  const offset = page * pageSize
  try {
    const res = await fetch(
      `https://api.bgm.tv/v0/users/undef_baka/collections?subject_type=2&type=2&limit=${pageSize}&offset=${offset}`,
    )
    if (!res.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await res.json()
    const totalSize = data.total
    animeList.value = animeList.value.concat(data.data)
    if (offset + data.data.length >= totalSize) {
      loading.value = false
    }
    page++
  } catch (error) {
    loading.value = false
  }
}

// 节流
let ticking = false

async function updateOnScroll(event: Event) {
  if (ticking) return
  ticking = true
  const element = event.target as HTMLElement
  // 这里在处理兼容问题，正常情况元素滚动用元素，页面滚动用 document 就行
  const isBottom = document.documentElement.scrollTop ? document.documentElement.scrollHeight - document.documentElement.scrollTop <= document.documentElement.clientHeight + 100 :
    element.scrollHeight - element.scrollTop <= element.clientHeight + 100
  if (isBottom) {
    await fetchAnimeList()
  }
  ticking = false
}

onMounted(async () => {
  await fetchAnimeList()
  nextTick(() => {
    const element = document.querySelector('.n-layout-content .n-scrollbar-container')
    element?.addEventListener('scroll', updateOnScroll)
    document.addEventListener('scroll', updateOnScroll)
  })
})

onUnmounted(() => {
  const element = document.querySelector('.n-layout-content .n-scrollbar-container')
  element?.removeEventListener('scroll', updateOnScroll)
  document.removeEventListener('scroll', updateOnScroll)
})
```