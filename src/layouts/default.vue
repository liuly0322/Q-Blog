<template>
  <Header text-gray-700 dark:text-gray-200 />
  <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
    <router-view />

    <Counter :initial="10" />
  </main>
  <Footer text-gray-700 dark:text-gray-200 />
</template>
