<p align='center'>
  <img src='docs/logo.png' width='200'/>
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

参考 [TOV](https://github.com/dishait/tov-template) 的 Vite2 + Vue3 模板

- Vite2，支持博客热更新
- Vue3 + TypeScript，纯组合式 API
- Naive UI，Vue3 UI 库
- 响应式布局
- 夜间模式
- 半 SSG，博客 url 仍然通过路由跳转，但是默认生成了包含标题简介等信息的静态界面

## 食用方法

### 自动部署

[Github Actions 示例](https://github.com/liuly0322/blog-static/blob/posts/.github/workflows/test.yml)

### 手动部署

需要部署在域名根目录下，或者自行修改路由

clone 本仓库后，确保 node 版本号大于等于 14, 并已经安装 npm

```bash
npm install -g pnpm # 如果还未安装 pnpm
pnpm i
```

博客写在 `posts` 文件夹下，markdown 格式。YAML frontmatter 需至少包含 title, date, tags

预览：

```bash
pnpm run dev # run server at `localhost:3000`
```

部署：

```bash
pnpm run build # compile to `dist` folder
```
