<p align='center'>
  <img src='public/pwa-192x192.png' width='192'/>
</p>

<p align='center' style="font-size: 0.6em;">图文无关，只是因为太可爱了</p>

<h1 align='center'>Q Blog</h1>

<p align="center">

  <a href="https://github.com/liuly0322/Q-Blog/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/liuly0322/Q-Blog?color=blue">
  </a>

  <a href="https://www.codefactor.io/repository/github/liuly0322/q-blog">
    <img src="https://img.shields.io/codefactor/grade/github/liuly0322/q-blog/main">
  </a>

</p>

<p align='center'>Q-Blog - Quicker and Cuter</p>

## 说明

一个使用 Vue3.0 的静态博客站示例，自用于 [个人博客](http://blog.liuly.moe)

参考 [TOV](https://github.com/dishait/tov-template) 的 Vite5 + Vue3 模板（裁了个很小的子集）

- TypeScript
- Naive UI
- 响应式布局
- 夜间模式
- PWA

## 食用方法

### 自动部署

[Github Actions 示例](https://github.com/liuly0322/Q-Blog/blob/main/.github/workflows/build.yml)

### 手动部署

```bash
npm install -g pnpm # 如果还未安装 pnpm
pnpm i
```

开发：

```bash
pnpm dev # run server at `localhost:3000`
```

部署：

```bash
pnpm build # compile to `dist` folder
pnpm preview # preview the production build
```
