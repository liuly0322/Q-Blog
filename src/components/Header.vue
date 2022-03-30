<template>
  <header>
    <n-card content-style="display:flex;align-items:center;justify-content:space-between">
      <div class="flex">
        <n-avatar round :size="48" src="https://q2.qlogo.cn/g?b=qq&nk=453026205&s=100" />
        <span class="subtitle">Life is but code.</span>
      </div>
      <div class="flex">
        <n-menu
          v-model:value="activeKey"
          class="nav-landscape"
          mode="horizontal"
          :options="menuOptions"
        />
        <n-dropdown trigger="click" :options="phoneOptions" @select="phoneNacSelect">
          <n-button text class="nav-phone">
            <i-carbon:menu />
          </n-button>
        </n-dropdown>
      </div>
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
const phoneOptions = [
  {
    label: '🏠 主页',
    key: '/',
  },
  {
    label: '🗃️ 归档',
    key: '/archive',
  },
  {
    label: '🏷️ 标签',
    key: '/tags',
  },
  {
    label: '🔗 友链',
    key: '/links',
  },
  {
    label: '❓ 关于',
    key: '/about',
  },
]

export default defineComponent({
  setup() {
    const router = useRouter()
    return {
      activeKey: ref<string | null>(null),
      menuOptions,
      phoneOptions,
      phoneNacSelect(key: string | number) {
        router.push(String(key))
      },
    }
  },
})
</script>

<style scoped>
header {
  padding: 10px;
}
.subtitle {
  line-height: 48px;
  padding: 0 20px;
  font-size: 1.2em;
}

@media screen and (max-width: 639px) {
  .nav-landscape {
    display: none;
  }
}

@media screen and (min-width: 640px) {
  .nav-phone {
    display: none;
  }
}
</style>
