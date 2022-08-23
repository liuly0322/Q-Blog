<h1 align='center'>Q Blog</h1>

<p align='center'>
  <img src='docs/logo.png' alt='Q-Blog - Quicker and Cute' width='100'/>
</p>

<p align='center'>Q-Blog - Quicker and Cuter</p>

## 说明

一个使用 Vue3.0 的静态博客站示例，目前 [个人自用](http://blog.liuly.moe)

参考 [TOV](https://github.com/dishait/tov-template) 的 Vite2 + Vue3 模板

组件库采用 naive-ui, Vue3 + TS 写起来很爽（）

特性：

- 响应式布局
- 夜间模式

## 问题

- 目前是 SPA 应用，SEO 不友好
- 本地构建文档暂时不完善

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
pip install -r requirement.txt # 安装 python 依赖，可以在虚拟环境中进行
```

博客写在 posts 文件夹下，md 格式

需要有 YAML frontmatter, 至少包含 title, date, tags

写完后： 

```bash
python parse_blogs/parse.py # 在项目根目录下运行
```

在自己浏览器上预览效果

```bash
pnpm run dev
```

部署

```bash
pnpm run build
```

即可生成静态文件在 dists 文件夹下，自行部署即可

默认路由方式 History 而不是 Hash，这意味着自行部署可能需要对服务器进行相关设置，请求默认解析到 `index.html`
