<script setup lang="ts">

const router = useRouter()
const go = () => {
  router.push(`/hi/${encodeURIComponent('123')}`)
}
</script>

<template>
  <div>
    <div text-4xl>
      <div i-carbon-campsite inline-block />
    </div>
    <p>
      <a rel="noreferrer" href="https://github.com/antfu/vitesse" target="_blank">
        Vitesse
      </a>
    </p>
    <p>
      <em text-sm opacity-75>{{ 123 }}</em>
    </p>

    <div py-4 />

    <input
      id="input"
      v-model="name"
      :placeholder="'123'"
      :aria-label="'123'"
      type="text"
      autocomplete="false"
      p="x4 y2"
      w="250px"
      text="center"
      bg="transparent"
      border="~ rounded gray-200 dark:gray-700"
      outline="none active:none"
      @keydown.enter="go"
    >
    <label class="hidden" for="input">{{ 123 }}</label>

    <div>
      <button
        btn m-3 text-sm
        @click="go"
      >
        {{ 123 }}
      </button>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: default
</route>
