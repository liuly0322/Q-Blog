<script setup lang="ts">
import type { PostSummary } from '~/composables/useSummary'
import LineMdLoadingLoop from '~icons/line-md/loading-loop?width=48px&height=48px'

const props = defineProps<{
  post: PostSummary
}>()

const { isDark } = useDarks()
const utterancesContainer = ref<HTMLElement>()
function init() {
  utterancesContainer.value?.firstChild?.remove()

  const utterances = document.createElement('script')
  utterances.async = true
  utterances.setAttribute('src', 'https://utteranc.es/client.js')
  utterances.setAttribute('repo', 'liuly0322/liuly0322.github.io')
  utterances.setAttribute('issue-term', 'pathname')
  utterances.setAttribute('crossorigin', 'anonymous')
  if (isDark.value)
    utterances.setAttribute('theme', 'github-dark')
  else utterances.setAttribute('theme', 'github-light')

  utterancesContainer.value?.appendChild(utterances)
}

onMounted(init)
watch(() => props.post, init)

watch(isDark, (value) => {
  utterancesContainer.value?.querySelector('iframe')?.contentWindow?.postMessage(
    {
      type: 'set-theme',
      theme: value ? 'github-dark' : 'github-light',
    },
    'https://utteranc.es',
  )
})
</script>

<template>
  <div class="relative min-h-269px">
    <div ref="utterancesContainer" class="relative z-2 bg-surface" />
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <LineMdLoadingLoop class="text-accent" />
      <p class="mt-4">
        评论加载中...
      </p>
    </div>
  </div>
</template>
