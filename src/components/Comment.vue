<script setup lang="ts">
import type { PostSummary } from '~/composables/useSummary'
const props = defineProps<{
  post: PostSummary
}>()

const { isDark } = useDarks()
const vueUtterances = ref()
const init = () => {
  vueUtterances.value.firstChild?.remove()

  const utterances = document.createElement('script')
  utterances.async = true
  utterances.setAttribute('src', 'https://utteranc.es/client.js')
  utterances.setAttribute('repo', 'liuly0322/liuly0322.github.io')
  utterances.setAttribute('issue-term', 'pathname')
  utterances.setAttribute('crossorigin', 'anonymous')
  if (isDark.value)
    utterances.setAttribute('theme', 'github-dark')
  else utterances.setAttribute('theme', 'github-light')

  vueUtterances.value.appendChild(utterances)
}

onMounted(init)
watch(() => props.post, init)

watch(isDark, (value, oldValue) => {
  if (value !== oldValue) {
    vueUtterances.value.querySelector('iframe')?.contentWindow?.postMessage(
      {
        type: 'set-theme',
        theme: value ? 'github-dark' : 'github-light',
      },
      'https://utteranc.es',
    )
  }
})
</script>

<template>
  <div ref="vueUtterances" />
</template>
