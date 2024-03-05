---
title: 记一次打包体积优化
date: 2024-03-05 19:23:50
tags: [编译, rollup]
category: web
---

这段时间在改进自己的博客，做了很多有意思的事情（PWA，SSG，打包体积优化等等），写一篇记录一下最近的一次打包体积优化的过程。

一般来说，打包体积优化无非就是合并小文件、减少依赖项；压缩代码和移除无用代码等可以由打包工具完成。但有的时候依赖本身就很大，比如博客右边的那个音乐播放器 [APlayer](https://github.com/DIYgod/APlayer)，以 `APlayer.min.js` 的单文件形式分发，体积就有 57.9KB。整合到博客的 Vue 组件后，经过 Rollup 再次打包为 58.2KB。这时候就需要自己动手了。这里的情况是 APlayer 已经很久没有更新了，所以可以考虑自己修改源码。最后优化到了 42.1 KB。

<!-- more -->

简单来说过程就是把 APlayer 改写为原生 ESM 模块，去除 Webpack 相关代码。改写为模块形式就不用考虑导出的兼容性问题了，避免 Webpack 的一些兼容性代码（判断导出环境、class 的转译等等）。同时原生 ESM 模块也有利于 Tree-Shaking 做死代码消除（虽然只有一个导出成员，效果大概没有，不过还是可以介绍下这个技术）。

不过，最主要让人想改的原因还是 APlayer 用的模板在打包时看起来是某处的处理出了问题，最终产物会有这么一堆：

```javascript
e+=`>
    <ol`,n.listMaxHeight&&(e+=' style="max-height: ',e+=s(n.listMaxHeight),e+='"'),e+=`>
        `,i(d(1)(l({theme:n.theme,audio:n.audio,index:1}))),e+=`
    </ol>
</div>
<div class="aplayer-body">
    <div class="aplayer-pic" style="`,o&&(e+="background-image: url(&quot;",e+=s(o),e+="&quot;);"),e+="background-color: ",e+=s(n.theme)
```

很多的空白。这些空白在字符串里，因此 Rollup 无法去除，看着很不爽。

## 移除 Webpack 依赖

APlayer 用了 Webpack 以导入 SVG 和模板文件。我们需要手动做一下 Webpack 的转换过程，把这些文件转换为 JS 对象。

### SVG

```python
import os

# 原文：import play from '../assets/play.svg';
# 改写成：const play = `<svg......`;
# 也就是替换成 const 变量的形式

file_path = './src/assets'
svg_list = os.listdir(file_path)

for svg in svg_list:
    with open(f'{file_path}/{svg}', 'r', encoding='utf-8') as f:
        content = f.read()
        lines = [line.strip() for line in content.split('\n')]
        content = ''.join(lines)
        print(f'const {svg[:-4]} = `{content}`;')
```

`python svg.py > svg.js` 就好了。

### 模板文件

APlayer 用的 [art-template](https://github.com/aui/art-template/)。

```javascript
const precompile = require('art-template/lib/precompile')

// precompile src/template/player.art to dist/player.js
const options = {
    filename: 'some_prefix/list-item.art',
}
const compiledFunction = precompile(options).code

const fs = require('fs')
fs.writeFileSync('some_prefix/list-item.js', compiledFunction)
```

这样就可以导出某个模板预编译的结果（是一个 `(Options: Object) -> string` 的模板渲染函数）了。然后手动改一下导入导出声明。

### package.json

```json
{
  // ......
  "main": "src/js/index.js",
  "types": "src/APlayer.d.ts",
  "style": "dist/APlayer.min.css",
  "files": [
    "src",
    "dist"
  ]
  // ......
}
```

- `main` 是模块入口文件
- `types` 是类型声明文件
- `files` 指定了需要发布到 npm 的文件

## Tree-Shaking 简介

Tree-Shaking 是一个术语，指的是移除 JavaScript 上下文中的未引用代码。它依赖于 ES2015 模块系统中的静态结构特性，例如 `import` 和 `export`。这个术语和概念首次出现在 Rollup 中，但是现在已经被广泛使用。

参考 [Rollup 官网](https://rollupjs.org/introduction/#tree-shaking) 的介绍：

```javascript
// import the ajax function with an ES6 import statement
import { ajax } from './utils';
const query = 'Rollup';
// call the ajax function
ajax(`https://api.example.com?search=${query}`).then(handleResponse);
```

如果 `./utils` 里有其他的未被引用的函数，Rollup 就会移除它们。在 ESM 之前，这种优化是不可能的，因为 CommonJS 模块是动态的，它们的导出和导入是在运行时确定的（`module.exports` 是一个普通的对象，可以随时添加和删除属性）。
