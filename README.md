# Q Blog

## 项目说明

一个静态博客生成器

前端参考 [Vitesse](https://github.com/antfu/vitesse) 的 Vite2 + Vue3 模板

博客后端（？）采用 python 对 md 文件进行解析，生成分页相关的信息（相当于后端服务器做了个缓存），仍然生成的是静态资源，前端通过同源请求获取，并渲染界面

暂定前端页面结构：

- 公共顶栏，起导航作用（需要做响应式适配）
- 公共侧栏，文章中需要额外增加目录功能，公共的可以是音乐，一言等
  - 怎么实现根据当前是否是文章来确定是否维护 toc?
- 页面主体

组件库采用 naive-ui, 提供 dark mode 支持

这里吐槽一下 Vue 原生的 dark mode 支持已经非常完善了，UseDark 的逻辑非常智能，但是 element 也不支持

暂定前端网页路由结构：

```plaintext
.
├── about
│   └── about       // 关于
├── archive
│   └── archive     // 归档，展示标题和日期
├── index           // 主页，动态分页
├── links
│   └── links       // 友情链接
├── posts
│   ├── post1
│   └── post2       // 文章，会作为 component 渲染
└── tags            // 总览所有标签
    └── tag         // 具体标签页
```

例如标签页会根据 url 参数来请求对应的 `assets/tag.json`

暂定 "后端" 结构：

```plaintext
.
├── assets              // 生成的静态资源文件夹
│   ├── summary.json    // 博客所有文章的标题，摘要
│   └── tags
│       ├── tag1.json   // 每个 tag 对应的文章索引
│       └── tag2.json
├── posts
│   ├── blog1.md        // 在这里写博客
│   └── blog2.md
└── pages
    ├── about.md        // 关于
    ├── links.md        // 友情链接
    └── ......          // 更多特殊界面
```

感觉这个架构可以充分利用好前端框架的灵活性的同时降低系统的复杂度（无需维护数据库）

如果有啥好建议欢迎提 issue

## 目前的一些问题

- SEO: 现在 ViteSSG 由于 bug 似乎无法使用，暂时使用 Vite 构建
- 特殊界面采用什么样的格式，是在 Vue3 里写组件还是渲染后前端单独请求
- 博客生成的配置文件

## 开发进度

```bash
git init
```

争取不鸽（）

前端：

- [x] header
- [x] header 的响应式布局：移动端做一个可以展开的 menu
- [x] footer
- [x] 响应式布局的 sidebar
- [ ] sidebar 增加音乐播放
- [ ] home 页
- [ ] tags 页
- [ ] tag 页
- [ ] about 页
- [ ] links 页
- [ ] archive 页

后端

- [ ] parser
- [ ] ...