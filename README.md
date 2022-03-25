# Q Blog

<p align='center'>
  <img src='docs/logo-512.png' alt='Q-Blog - Quicker and Cute' width='100'/>
</p>

~~\#66ccff~~

## 项目说明

一个使用 Vue3.0 的静态博客站示例

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

梳理一下后端需要做的工作，主要是解析资源文件夹的 markdown 博客, 生成索引，于是就产生了如下的问题：

- 是否可以用 ts 写成 vite 插件的类似形式，由 `pnpm build` 一键构建？
  - 知识水平有限，暂时不会实现
- 需要产生哪些索引文件？这就需要具体分析前端各处的需求
  - home 页：   (标题索引，摘要，Option<标签s>)  for 博客 in 博客s
  - tags 页：   数量                          for 标签 in 标签s
  - tag 页：    标题索引                       for 博客 in 标签对应的博客s
  - archive 页：标题索引                       for 博客 in 博客s
  - search 框： 标题索引                       for 博客 in 博客s

标题索引指 标题 + 时间 + url，全站大部分地方都会用到，做一个总的 summary.json, 这个可以直接通过 App.vue import 得到，并 inject 给子组件

对于标签机制，一个博客贴的标签的长度应该和标题长度是一个数量级，因此也可以附在 summary.json 里，所有标签的统计可以通过前端完成

home 页的需求比较特殊，主要是需要额外的摘要，一个可行的策略是对每个文章额外生成一个 `{ post }_detail.json`

## 目前的其他问题

- SEO: 现在 ViteSSG bug 太多暂时无法 build，使用 Vite 替代
- 是否考虑博客支持统一的自定义配置文件，拓展成一个可用的博客框架

如果有啥好建议欢迎提 issue

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

- [x] summary.json
- [ ] post_detail.json

## 食用方法

clone 本仓库后，确保 node 版本号大于等于 14, 并已经安装 npm

```bash
npm install -g pnpm # 如果还未安装 pnpm
pnpm i
```

### 写博客

写在 posts 文件夹下，md 格式

需要有 YAML frontmatter, 至少包含 title, date, tags

### 开发

```bash
pnpm run dev
```

### 部署

**注意：**

**当前项目只针对默认部署在根目录下的情形，其余情况暂未兼容**

```bash
python parse_blogs/parse.py # 在项目根目录下运行
pnpm run build
```

即可生成静态文件在 dists 文件夹下，自行部署即可

默认路由方式 History 而不是 Hash，这意味着自行部署可能需要对服务器进行相关设置，请求默认解析到 `index.html`

#### GitHub Pages

根据 [taoky](https://github.com/taoky) 建议，可以选择部署在 Github Pages 上，后期也方便买域名

Github Pages 会把找不到文件的请求解析到 `404.html`，本项目已经针对此做了一定的配置

如果你也有兴趣部署在 Github Pages 上，注意需要在网页静态资源的根目录下添加 `.nojekyll` 文件