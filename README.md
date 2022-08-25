<p align='center'>
  <img src='docs/logo.png' width='200'/>
</p>

<h1 align='center'>Q Blog</h1>

<p align='center'>Q-Blog - Quicker and Cuter</p>

## 说明

一个使用 Vue3.0 的静态博客站示例，目前 [个人自用](http://blog.liuly.moe)

参考 [TOV](https://github.com/dishait/tov-template) 的 Vite2 + Vue3 模板

- TypeScript
- Naive UI
- 响应式布局
- 夜间模式
- 半 SSG，博客 url 仍然通过路由跳转，但是默认生成了包含标题简介等信息的静态界面

## 食用方法

### 自动部署

基于 Github Actions 实现

可以 fork [该仓库](https://github.com/liuly0322/liuly0322.github.io)

只需要在 posts 分支写博客即可

对 posts 分支进行的 push 操作会自动将构建出的静态资源部署到 main 分支

对 main 分支配置 Github Pages 后即可看到部署的静态界面

- 需要更改 posts 分支下的 `public/CNAME` 文件以适配部署域名，不需要域名的话直接删除该文件即可

### 手动部署

（目前仅测试部署在域名根目录的情形）

clone 本仓库后，确保 node 版本号大于等于 14, 并已经安装 npm

```bash
npm install -g pnpm # 如果还未安装 pnpm
pnpm i
```

博客写在 posts 文件夹下，md 格式

需要有 YAML frontmatter, 至少包含 title, date, tags

在自己浏览器上预览效果（目前暂时没做到热加载实时预览文章内容）

```bash
pnpm run dev
```

部署

```bash
pnpm run build
```

即可生成静态文件在 dists 文件夹下，自行部署即可

默认路由方式 History 而不是 Hash，这意味着可能需要对服务器进行相关设置，将请求默认解析到 `index.html`
