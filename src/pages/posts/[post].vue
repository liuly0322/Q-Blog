<script setup lang="ts">
const props = defineProps<{ post: string }>()
const url = computed(() => './' + props.post + '.json')
const { data } = useFetch(url, {refetch: true}).json()
</script>

<template>
  <div v-html="data" class="md-blog m-auto text-left"></div>
</template>