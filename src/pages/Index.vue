<script setup lang="ts">

const router = useRouter()
const go = () => {
  router.push(`/hi/${encodeURIComponent('123')}`)
}
</script>

<template>
  this is main
</template>

<route lang="yaml">
meta:
  layout: default
</route>
