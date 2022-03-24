# Q Blog

<p align='center'>
  <img src='logo-512.png' alt='Q-Blog - Quicker and Cute' width='100'/>
</p>

~~\#66ccff~~

## 项目说明

一个静态博客生成器

前端参考 [Vitesse](https://github.com/antfu/vitesse) 的 Vite2 + Vue3 模板

博客后端（？）采用 python 对 md 文件 YAML front matter 进行解析，生成相应 json 静态文件，前端通过同源请求获取

组件库采用 naive-ui, Vue3 + TS 写起来很爽（）

- 响应式布局
- 夜间模式

前端网页路由结构：

```plaintext
.
├── about.md        // 关于页面
├── archive.vue     // 归档，只需要标题，发布时间等信息
├── index           // 主页，分页如何实现？单页面 / 额外增添查询参数 / 路由
├── links.vue       // 友情链接
├── posts           // 文件夹，该目录本身没有意义
│   ├── post1.md
│   └── post2.md    // md 作为组件渲染
└── tags            // 总览所有标签
    └── [tag].vue   // 具体标签页
```

例如标签页会根据 url 参数来请求对应的 `assets/tag.json`

暂定 "后端" 文件结构：

```plaintext
.
├── assets              // 生成的静态资源文件夹
│   ├── summary.json    // 博客所有文章的标题，(摘要)，时间，url
│   │                   // 用于主页，归档，侧边栏搜索
│   │                   // 考虑通过注入方式实现？ APP.vue 的 setup 里单次载入
│   └── tags
│       ├── tag1.json   // 每个 tag 对应的文章 url
│       └── tag2.json
└── posts
    ├── blog1.md        // 在这里写博客
    └── blog2.md
```

大部分工作还是 Vue 完成，Python 主要负责生成索引文件

如果有啥好建议欢迎提 issue

## 目前的一些问题

- SEO: 现在 ViteSSG bug 太多暂时无法 build，使用 Vite 替代
- 博客支持统一的自定义配置文件？

## 开发进度

争取不鸽（）

成果暂时在 [这个页面](https://liuly0322.github.io/)

前端：

- [x] header
- [x] header 的响应式布局：移动端做一个可以展开的 menu
- [x] footer
- [x] 响应式布局的 sidebar
- [x] sidebar 增加音乐播放
- [x] npm 发布自己魔改过后的 aplayer 包, 增加 ts 支持
- [ ] home 页
- [ ] tags 页
- [ ] tag 页
- [x] about 页
- [x] links 页
- [ ] archive 页
- [ ] sidebar 增加搜索功能
- [ ] sidebar 增加文章目录

后端

- [ ] 暂未开始

## 食用方法

clone 本仓库后，确保 node 版本号大于等于 14, 并已经安装 npm

```bash
npm install -g pnpm # 如果还未安装 pnpm
pnpm i
```

### 开发

```bash
pnpm run dev
```

### 部署

**注意：**

**当前项目只针对默认部署在根目录下的情形，其余情况暂未兼容**

```bash
pnpm run build
```

即可生成静态文件在 dists 文件夹下，自行部署即可

默认路由方式 History 而不是 Hash，这意味着自行部署可能需要对服务器进行相关设置，请求默认解析到 `index.html`

#### GitHub Pages

根据 [taoky](https://github.com/taoky) 建议，可以选择部署在 Github Pages 上，后期也方便买域名

Github Pages 会把找不到文件的请求解析到 `404.html`，本项目已经针对此做了一定的配置

如果你也有兴趣部署在 Github Pages 上，注意需要在网页静态资源的根目录下添加 `.nojekyll` 文件