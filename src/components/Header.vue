<template>
  <header>
    <n-card>
      <n-card :bordered="false">
        <n-avatar
          round
          :size="48"
          src="https://q2.qlogo.cn/g?b=qq&nk=453026205&s=100"
        />
        <span class="subtitle">Life is but code.</span>
        <span class="title">
          liuly 的博客
        </span>
      </n-card>
      <n-menu
        v-model:value="activeKey"
        style="float: right"
        mode="horizontal"
        :options="menuOptions"
      />
    </n-card>
  </header>
</template>

<script lang="ts">
import type { MenuOption } from 'naive-ui'
import { RouterLink } from 'vue-router'

const menuOptions: MenuOption[] = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/',
        },
        { default: () => '主页' },
      ),
    key: 'home',
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/archive',
        },
        { default: () => '归档' },
      ),
    key: 'archive',
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/tags',
        },
        { default: () => '标签' },
      ),
    key: 'tags',
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/links',
        },
        { default: () => '友链' },
      ),
    key: 'links',
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/about',
        },
        { default: () => '关于' },
      ),
    key: 'about',
  },
]

export default defineComponent({
  setup() {
    return {
      activeKey: ref<string | null>(null),
      menuOptions,
    }
  },
})
</script>

<style scoped>
header {
  padding: 10px;
}
.title {
  float: right;
  padding: 8px;
  font-size: 1.5em;
}
.subtitle {
  line-height:48px;
  display: ruby-text;
  padding: 0 20px;
  font-size: 1.2em;
}
</style>
