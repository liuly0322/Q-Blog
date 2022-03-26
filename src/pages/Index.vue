<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import { SummaryKey } from '~/types'

const md = new MarkdownIt()
const summary = inject(SummaryKey)
const details = ref([] as Array<string>)
const num_posts = summary?.length as number
const pages_max = Math.floor(num_posts / 10)
const now_page = ref(0)

const details_base_url = '/details/'

const get_detail = async (i: number) => {
  const { data } = await useFetch(details_base_url + summary?.at(i)?.url + '.json').get().json()
  details.value[i] = md.render(data.value.content)
}

const get_now_page = async () => {
  // 根据 now_page，如果是 0 就访问 0 到 9, etc
  for (let i = 10 * now_page.value; i < 10 * now_page.value + 10; i++) {
    if (i == num_posts)
      break
    get_detail(i)
  }

}

onMounted(() => {
  get_now_page()
})

const router = useRouter()
const go = () => {
  router.push(`/hi/${encodeURIComponent('123')}`)
}
</script>

<template>
  <n-card :title="summary?.at(i)?.title" v-for="i in 5">
    <div v-html="details[i]"></div>
  </n-card>
</template>

<route lang="yaml">
meta:
  layout: default
</route>
