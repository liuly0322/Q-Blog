<script setup lang="ts">
import AntDesignLeftCircleOutlined from '~icons/ant-design/left-outlined?width=18px&height=18px'
import AntDesignRightCircleOutlined from '~icons/ant-design/right-outlined?width=18px&height=18px'

const { page, pageMax } = usePage()

function decPage() {
  if (page.value > 1)
    page.value--
}

function incPage() {
  if (page.value < pageMax)
    page.value++
}
</script>

<template>
  <div class="flex text-base">
    <AntDesignLeftCircleOutlined
      class="mx-1 pt-1.5"
      :class="page === 1 ? 'cursor-not-allowed' : 'cursor-pointer'"
      @click="decPage"
    />
    <template v-for="i in pageMax" :key="i">
      <span
        class="cursor-pointer mx-1.5"
        :class="{ 'border-hex-18a058': i === page, 'text-hex-18a058': i === page }"
        :style="i === page ? 'border-bottom-width: 1px' : ''"
        @click="page = i"
      >{{ i }}</span>
    </template>
    <AntDesignRightCircleOutlined
      class="mx-1 pt-1.5"
      :class="page === pageMax ? 'cursor-not-allowed' : 'cursor-pointer'"
      @click="incPage"
    />
  </div>
</template>
