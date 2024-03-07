---
title: 记一次打包体积优化
date: 2024-03-05 19:23:50
tags: [编译, rollup]
category: web
---

这段时间在改进自己的博客，做了很多有意思的事情（PWA，SSG，打包体积优化等等），写一篇记录一下最近的一次打包体积优化的过程。

一般来说，打包体积优化无非就是合并小文件、减少依赖项；压缩代码和移除无用代码等可以由打包工具完成。但有的时候依赖本身就很大，比如博客右边的那个音乐播放器 [APlayer](https://github.com/DIYgod/APlayer)，以 `APlayer.min.js` 的单文件形式分发，体积就有 57.9KB。整合到博客的 Vue 组件后，经过 Rollup 再次打包为 58.2KB。这时候就需要自己动手了。这里的情况是 APlayer 已经很久没有更新了，所以可以考虑自己修改源码。最后优化到了 31.5 KB。

完工后的结果在 [这个仓库](https://github.com/liuly0322/aplayer-ts)。

<!-- more -->

作为对比，这是所有网站代码完整的打包大小列表：

```shell
dist/manifest.webmanifest                          0.33 kB
dist/index.html                                    2.12 kB │ gzip:   1.03 kB
dist/assets/APlayer-DhvPXxPe.css                  10.25 kB │ gzip:   2.16 kB
dist/assets/index-CRtL4x1c.css                    14.78 kB │ gzip:   4.24 kB
dist/assets/_tag_-cGwZ-7N0.js                      2.42 kB │ gzip:   1.08 kB
dist/assets/links-CG_Ktntm.js                      3.27 kB │ gzip:   1.50 kB
dist/assets/workbox-window.prod.es5-DFjpnwFp.js    5.29 kB │ gzip:   2.20 kB
dist/assets/_post_-Bk7OZ2kU.js                     5.83 kB │ gzip:   2.70 kB
dist/assets/Tag-CndKAshl.js                       12.76 kB │ gzip:   3.90 kB
dist/assets/bangumi-pv0vBN1_.js                   13.31 kB │ gzip:   5.40 kB
dist/assets/Popover-D9bQVC9_.js                   27.90 kB │ gzip:   9.67 kB
dist/assets/APlayer-BdWmGOkJ.js                   31.48 kB │ gzip:   9.66 kB
dist/assets/Index-xN4V0yjd.js                     60.33 kB │ gzip:  17.96 kB
dist/assets/index-CoCWtjYS.js                    373.90 kB │ gzip: 119.62 kB
```

简单来说过程就是先去除 Webpack 相关打包代码，把 APlayer 改写成原生 ESM 模块；之后再重写一些代码，增加 Tree-Shaking 的支持。改写为标准 ESM 模块形式就不用考虑导出的兼容性问题了（而是由上层打包工具统一管理转译），避免 Webpack 的一些兼容性代码（判断导出环境、class 的转译等等）。同时，ESM 模块也有利于代码混淆，后文会具体介绍模块机制对打包的影响。

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

很多的空白。这些空白在字符串里，因此 Rollup 无法去除，看着很不爽。不过这应该是作者打包时遇到的 bug，后文我并没有复现出来（当然这些空白没了肯定是更好的）。

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

这样就可以导出某个模板预编译的结果（是一个 `(Options: Object) -> string` 的模板渲染函数）了。然后手动改一下导入导出声明，把导入 art 文件（原先由 Webpack 处理）改成导入这个预编译的 JS 文件。

## Tree-Shaking

### 概念

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

### 模块机制与打包

ESM 模块是静态的：这句话实际的意思是，可以很轻松的通过静态分析获取不同模块的引用关系。例如：

```javascript
// ESM 静态导出和引用
// module.js
export const a = 1;
export function b() {}
export function c() {}
// index.js
import { a, b } from './module.js';
b(a);
// CommonJS 动态导出和引用
// module.js
module.exports = {
  a: 1,
  b: function() {},
  c: function() {}
};
// index.js
const module = require('./module.js');
module.b(module.a);
```

上面的 ESM 代码静态声明了 `index.js` 引用了 `module.js` 的 `a` 和 `b`，除此之外其他成员都无法被 `index.js` 访问，可以放心删除。但是 CommonJS 版本的导出是动态的，无法判断 `module` 对象之后具体遭遇了什么：它可能被传入别的文件的别的函数，或者其他一些更复杂的情况，因此无法做 `c` 的删除。

此外，静态声明所有导出还有利于代码混淆及体积压缩。因为可以确定模块导出的每个成员都只被绑定到了某个变量名（或如果在多个不同的地方被引入就是某些变量名）上：即只有通过这个（这些）导出的变量名才能访问到这个成员。因此，可以安全的把导出的成员重命名为更短的名字。

注意，上面所说的 ESM 的好处其实不是 ESM 和 CommonJS 的区别。同为 ESM，也可能是分别导出变量和函数，或者导出一整个对象（或类）：

```javascript
// ESM 导出变量和函数
// module.js
export const a = 1;
export function b() {}

// ESM 导出对象
// module.js
export default {
  a: 1,
  b: function() {}
}

// ESM 导出类
// module.js
export default class A {
    constructor() {
        this.a = 1;
    }
    b() {}
    c() {}
}
// 类的方法和属性无法重命名或消除
```

这个时候只有第一种导出变量和函数的情况可以被良好的优化。

关于类的讨论可以参考 [rollup#349](https://github.com/rollup/rollup/issues/349)。

### 增加 Tree-Shaking！

~~到了最激动人心的一节~~。

增加 Tree-Shaking 支持其实就是去除运行时不需要的代码。在翻阅源代码后，可以发现 APlayer 有一个吸底模式是我们不需要的，而且占用了很大的空间。我们就以这个为例说明怎么让模块代码可以被 Tree-Shaking。

根据上文对 Tree-Shaking 原理的介绍，我们可以先设计一个导出，表示我们 opt-in 的需要吸底模式。最直观的声明方式：

```javascript
import { APlayer, APlayerFixedModePlugin } from 'aplayer-ts';

const instance = APlayer().use(APlayerFixedModePlugin)
instance.mount(document.getElementById('player'));
```

（参考了 [markdown-it](https://github.com/markdown-it/markdown-it/) 的处理）

可惜 APlayer 原生的声明方式是：

```javascript
import APlayer from 'aplayer';

const instance = new APlayer({
    container: document.getElementById('player'),
    ...
});
```

直接绑定到某个元素上并创建播放器，这样就没有使用插件动态修改的时间了。这个初始化方法到上面的优雅一点的代码距离有点远，因此最后采取了一个折中一点的方式：

```javascript
import APlayer from 'aplayer-ts'
import 'aplayer-ts/src/css/base.css'
import 'aplayer-ts/src/css/fixed.css'

// 用 enableFixedModeOnce 表示下一次构造的时候使用吸底模式
enableFixedModeOnce()
const instance = new APlayer({ /* refer to the aplayer doc */ })
```

（顺便可以看到，CSS 的 Tree-Shaking 是比较好处理的，把原来的 CSS 拆分一下，然后如果不需要吸底模式，不引入 `fixed.css` 就行）

吸底模式和普通模式相比，最大的区别是模板的渲染函数。所以这里 `enableFixedModeOnce` 需要完成的任务就是通知 APlayer 下次构造的时候使用它提供的吸底模式的模板渲染函数。可以想象，如果不引入 `enableFixedModeOnce`，那么吸底模式的模板渲染函数就不会被引用，也就不会被打包进来。

下面示意一下各个文件改造后的关系：

`render.js`：

```javascript
export function notFixedModeTplRenderers() {
  return {
    patchA: function() {},
    patchB: function() {},
    patchC: function() {},
  }
}

export function fixedModeTplRenderers() {
  return {
    patchA: function() {},
    patchB: function() {},
    patchC: function() {},
  }
}

function render(..., renderers) {
  // ...
  renderers.patchA()
  // ...
  renderers.patchB()
  // ...
  renderers.patchC()
  // ...
}
```

当然，完全可以吸底模式和普通模式分成两个不同的渲染（`render`）函数。不过因为这里的情景是渲染函数有些部分可以复用，所以通过上面的代码实现了一种多态。

`player.js`

```javascript
// 这里不引入 opt-in 的 fixedModeTplRenderers
import { notFixedModeTplRenderers } from './render.js'

let getTplRenderers = notFixedModeTplRenderers
export function setTplRenderers(renderers) {
    getTplRenderers = renderers
}

class APlayer {
  constructor(options) {
    options.fixed = false;
    const tplRenderers = getTplRenderers()
    if (getTplRenderers != notFixedModeTplRenderers) {
      options.fixed = true;
      getTplRenderers = notFixedModeTplRenderers
    }
    // ......
    render(..., tplRenderers)
  }
}
```

这里默认采用 `notFixedModeTplRenderers`。为了能允许 `enableFixedModeOnce` 修改渲染函数，提供一个 `setTplRenderers` 方法。

`index.js`

```javascript
import APlayer from './player';

import { setTplRenderers } from './player';
import { fixedModeTplRenderer } from './render';

export const enableFixedModeOnce = () => {
    setTplRenderers(fixedModeTplRenderer)
}

export default APlayer;
```

实现一下 `enableFixedModeOnce` 就好了。如果不引入 `enableFixedModeOnce`，Tree-Shaking 时，随着 `enableFixedModeOnce` 被除去，`fixedModeTplRenderer` 也会被除去，就达到了我们的目的。

### Partial Evaluation

最后，我们可以再联想下其他的编译期优化。

> 做软件的需要上 Computer Architecture 这门课吗？ - 圆角骑士魔理沙的回答 - 知乎 <https://www.zhihu.com/question/24975949/answer/370015097>
>
> 你学过编译器原理，知道语言分编译器解释器，但其实是语言的实现分编译器解释器，因为你动态编译再执行就是解释器，你把一个解释器的机器码跟被解释程序的字符串或者 AST 或者什么稀奇古怪的中间表示的机器码合并在一起你就是个编译器。你也知道一个叫二村映射的把给一个 Partial Evaluator 输入一个 Partial Evaluator 再输入一个 Partial Evaluator 就能得到一个 Interpreter to Compiler Converter 的东西，从而明白 Interpreter Compiler 的分别挺 trivial 的。

这段话读着很爽，~~不明觉厉~~。Partial Evaluation 是一种编译器优化技术，它可以把一个解释器转换为编译器。这个技术的核心思想是，把一个程序的一部分（partial）的输入固定下来，然后对这个部分进行编译。这样可以把一部分的运行时计算提前到编译时，从而提高程序的运行效率。

下面的 CPP 代码就是最简单的一种 Partial Evaluation：

```cpp
int add_one(int a) {
    return a + 1;
}

int main() {
    return add_one(1);
}
```

用 g++ O3 选项：

```asm6502
main:
.LFB1:
  .cfi_startproc
  endbr64
  movl    $2, %eax
  ret
  .cfi_endproc
```

CPP 编译器在编译时就把 `add_one(1)` 的结果计算出来了。除此之外，CPP 的模板特性也能支持编译期运算。

ESM 在静态导入导出声明的特性下，其实也是有机会做更激进的编译器优化的。可以想象，若某些模块的导出函数只会有唯一的调用，且输入确定，那么就可以据此在编译期对 AST 进行优化。在 CommonJS 时期，Facebook 曾经有过一个 [prepack](https://github.com/facebookarchive/prepack) 项目是试图做 Partial Evaluator 的，但可惜不再维护了。开发团队回应：

> The biggest challenge with Prepack is that you need the whole program along with an accurate model of the environment it will run in. Even then, you can only really run it on global code (or code that is known to only depend on state that is set up by the global code and never modified later). This is a very specialized scenario and setting it up properly takes a considerable investment. So far, I am not aware of anyone currently pursuing such a scenario.

ESM 时期这类项目应该是有机会有后续进展的，因为对 ESM 模块而言，静态的导入导出声明使得可以更简单的获取到模块的精确调用模型。值得期待。
