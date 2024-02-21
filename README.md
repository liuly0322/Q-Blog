<p align='center'>
  <img src='docs/logo.png' width='200'/>
</p>

<p align='center' style="font-size: 0.6em;">图文无关，只是因为太可爱了</p>

<h1 align='center'>Q Blog</h1>

<p align="center">

  <a href="https://github.com/liuly0322/Q-Blog/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/liuly0322/Q-Blog?color=blue">
  </a>

  <a href="https://github.com/liuly0322/Q-Blog/actions/workflows/build.yml">
    <img src="https://github.com/liuly0322/Q-Blog/actions/workflows/build.yml/badge.svg?branch=main">
  </a>

  <a href="https://www.codefactor.io/repository/github/liuly0322/q-blog">
    <img src="https://img.shields.io/codefactor/grade/github/liuly0322/q-blog/main">
  </a>

</p>

<p align='center'>Q-Blog - Quicker and Cuter</p>

## 说明

一个使用 Vue3.0 的静态博客站示例，自用于 [个人博客](http://blog.liuly.moe)

参考 [TOV](https://github.com/dishait/tov-template) 的 Vite2 + Vue3 模板

- Vite2，支持博客热更新
- Vue3 + TypeScript，纯组合式 API
- Naive UI，Vue3 UI 库
- 响应式布局
- 夜间模式
- 半 SSG，博客 url 仍然通过路由跳转，但是默认生成了包含标题简介等信息的静态界面

## 食用方法

### 自动部署

基于 Github Actions 实现

可以参考本仓库的 [build.yml](./.github/workflows/build.yml)

### 手动部署

（目前仅测试部署在域名根目录的情形）

clone 本仓库后，确保 node 版本号大于等于 14, 并已经安装 npm

```bash
npm install -g pnpm # 如果还未安装 pnpm
pnpm i
```

博客写在 posts 文件夹下，md 格式

需要有 YAML frontmatter, 至少包含 title, date, tags

在自己浏览器上预览效果

```bash
pnpm run dev
```

部署

```bash
pnpm run build
```

即可生成静态文件在 dists 文件夹下，自行部署即可

默认路由方式 History 而不是 Hash，这意味着可能需要对服务器进行相关设置，将请求默认解析到 `index.html`
