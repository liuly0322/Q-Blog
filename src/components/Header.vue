<template>
  <header>
    <el-card>
    <router-link to="/about" title="liuly 的博客">
      liuly 的博客
    </router-link>
      <el-dropdown style="float:right">
        <span class="el-dropdown-link">
          <div i-carbon-menu class="icon-btn"></div>
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>Action 1</el-dropdown-item>
            <el-dropdown-item>Action 2</el-dropdown-item>
            <el-dropdown-item>Action 3</el-dropdown-item>
            <el-dropdown-item disabled>Action 4</el-dropdown-item>
            <el-dropdown-item divided>Action 5</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-card>
  </header>
</template>

<style scoped>
header {
  padding: 10px;
}
</style>