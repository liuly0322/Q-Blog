<script setup lang="ts">
const { isDark } = useDarks()
const vueUtterances = ref()
const props = defineProps({
  repo: {
    type: String,
    required: true
  },
  issueTerm: {
    type: String,
    required: true
  },
})

const commentInit = () => {
  let utterances = document.createElement("script")

  utterances.async = true
  utterances.setAttribute("src", "https://utteranc.es/client.js")
  utterances.setAttribute("repo", props.repo)
  utterances.setAttribute("issue-term", props.issueTerm)
  utterances.setAttribute("crossorigin", "anonymous")
  if (isDark.value)
    utterances.setAttribute("theme", "github-dark")
  else
    utterances.setAttribute("theme", "github-light")

  vueUtterances.value.appendChild(utterances)
}
onMounted(() => nextTick(commentInit))

watch(isDark, (value, oldValue) => {
  if (value !== oldValue)
    document.querySelector("iframe")?.contentWindow?.postMessage({
      type: "set-theme",
      theme: value ? "github-dark" : "github-light"
    }, 'https://utteranc.es')
})
</script>

<template>
  <div class="vue-utterances" ref="vueUtterances">
    <!-- utterances script here -->
  </div>
</template>
