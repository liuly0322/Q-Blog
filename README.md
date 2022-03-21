# Q Blog

## 项目说明

一个静态博客生成器

前端参考 [Vitesse](https://github.com/antfu/vitesse) 的 Vite2 + Vue3 模板

博客后端（？）采用 python 对 md 文件进行解析，生成分页相关的信息（相当于后端服务器做了个缓存），仍然生成的是静态资源，前端通过同源请求获取，并渲染界面

暂定 "后端" 结构：

```plaintext
.
├── assets              // 生成的静态资源文件夹
│   ├── blogs
│   │   ├── blog1.md    // 这里还没想好放 md 还是预渲染好的 html
│   │   └── blog2.md
│   ├── summary.json    // 博客所有文章的标题，摘要
│   └── tags
│       ├── tag1.json   // 每个 tag 对应的文章索引
│       └── tag2.json
└── posts
    ├── blog1.md        // 在这里写博客
    └── blog2.md
```

感觉这个架构可以充分利用好前端框架的灵活性的同时降低系统的复杂度（无需维护数据库）

如果有啥好建议欢迎提 issue

## 开发进度

```bash
git init
```

争取不鸽（）