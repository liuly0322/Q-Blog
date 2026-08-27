---
title: 当 Agent 开始编程正在运行的网页
date: 2026-08-28 12:00:00
tags: [AI, GIS, JavaScript]
category: web
---

> 本文在 AI 辅助下完成资料调研、结构整理与文字润色。

如果 Agent 本来就会写 JavaScript，为什么还要让它一点点操作网页？

这几天我搓了一个 [Maputnik-AI](https://github.com/liuly0322/Maputnik-AI)。它是地图样式编辑器 [Maputnik](https://github.com/maplibre/maputnik) 的一个实验性分支：导入一份 CSV，再告诉 Agent 想画成什么样，它就会直接修改眼前这张 MapLibre 地图。

![Maputnik-AI Agent 工作区](./programming-live-webpage/20260828-agent-workspace.png)

比如让它把热点数据画成绿色方格，根据数值调整深浅，同时简化底图，最后得到的是下面这样一张仍然可以继续编辑的地图：

![Agent 生成的方格地图](./programming-live-webpage/20260828-agent-generated-grid-map.png)

项目本身可以在 [在线 Demo](https://liuly.moe/Maputnik-AI/) 里玩，不过这篇文章主要不是安利项目。把它做出来以后，我更感兴趣的反而是它背后的交互方式：**与其让 Agent 学会使用一个网页，不如让网页成为 Agent 可以编程的环境。**

<!-- more -->

## 为什么非得让 Agent 点按钮？

现在让 Agent 操作网页，最直接的办法当然是 Browser Use。Agent 看截图、DOM 或 accessibility tree，找到输入框和按钮，然后 click、type、scroll，再观察页面有没有发生预期的变化。

这套方式很通用。一个完全没为 Agent 做过适配的网站，也可以尝试操作。但放到 Maputnik 这种复杂编辑器里，感觉就有些奇怪了。

比如用户说：

> 把所有道路图层的饱和度降低一点，隐藏次要标注，再用当前导入的数据做一个分级点图。

人通过界面完成这件事，需要在一长串图层里反复查找和修改。Browser Agent 如果忠实模仿人，也得重复很多次“寻找图层—展开属性—修改数值—重新观察”。更麻烦的是，页面上显示出来的只是应用状态的一种投影：Agent 看到某个图层被选中了，却未必能方便地拿到它在完整 style 中的对象；看到一张地图，也不等于拿到了当前 viewport、source 和用户刚刚点击的 features。

但这些东西明明已经存在于网页里。

Maputnik 内部有完整的 style object，MapLibre 已经提供了 `getStyle()`、`addLayer()`、`setPaintProperty()` 等 API。用户在界面里做的每一次修改，最后也都要落到这些对象上。先把它们画成 UI，再让 Agent 从 UI 猜回对象，多少有点把答案藏起来再出题的意思。

所以 Maputnik-AI 选择直接把对象交给 Agent。

## 一个工具，里面是一门编程语言

项目给模型注册的核心 tool 其实只有一个：

```text
run_javascript({ code })
```

这段 JavaScript 执行时，可以直接访问：

```js
map        // 正在显示的 MapLibre Map
style      // 正在编辑的 Maputnik style
runtime    // viewport、selection、数据图层等应用能力
datasets   // 浏览器本地导入的 CSV 数据
workspace  // 当前选中图层、图层列表等工作区状态
log        // 返回给 Agent 的输出
```

于是 Agent 可以写这样的代码：

```js
const ds = datasets.list()[0];
const rows = datasets.query(ds.id, row => Number(row.value) > 0);
const values = rows.map(row => Number(row.value));
const max = Math.max(...values, 1);

for (const layer of style.layers) {
  if (layer.type === "symbol") {
    layer.layout ??= {};
    layer.layout.visibility = "none";
  }
}

const sourceId = `agent-dataset:${ds.id}`;
style.sources[sourceId] = {
  type: "geojson",
  data: datasets.toGeoJSON(ds.id, {
    type: "Point",
    coordinates: ["lon", "lat"],
  }),
};
style.layers.push({
  id: `${sourceId}-layer`,
  type: "circle",
  source: sourceId,
  metadata: {"maputnik:role": "overlay"},
  paint: {
    "circle-radius": [
      "interpolate", ["linear"],
      ["to-number", ["get", "value"]],
      0, 2,
      max, 12,
    ],
    "circle-color": "#238b45",
    "circle-opacity": 0.75,
  },
});

log(`visualized ${rows.length} rows, max=${max}`);
```

筛选、求最大值、遍历图层、修改样式、创建数据图层，都在一次执行里完成。这就很爽：编程语言已经替我们发明好了循环、分支、变量、函数和错误处理，不需要再把这些能力分别做成 `hide_label`、`get_next_layer`、`calculate_max`、`add_circle_layer`，然后让模型一轮一轮地调用。

这里的“持久环境”需要稍微说准确一点。每次 `run_javascript` 都会执行一段新的代码，上一段代码里的局部变量不会神奇地留到下一次；真正持续存在的是 `map`、`style`、datasets 和整个 workspace。人手工改完地图后，下一次 Agent 拿到的就是修改后的对象。Agent 改完以后，人也可以立即在原来的编辑器里接着调，而不是打开一份 Agent 另行生成的 artifact。

## Browser Use、MCP，然后再往前一步

Browser Use 像是让 Agent 扮演一个网页用户。它几乎哪里都能去，代价是很多时候只能从表现层猜应用内部发生了什么。

MCP 或普通 tool calling 则让应用直接告诉 Agent：“我可以搜索、添加图层、修改颜色。”相比猜按钮，这已经可靠得多。Chrome 最近推进的 [WebMCP](https://developer.chrome.com/docs/ai/webmcp) 也是这个方向：网页可以用 JavaScript 主动声明 tools，让 Agent 理解操作的目的，而不是模拟鼠标完成每一步。

但对于操作空间很大的应用，枚举动作会很快遇到另一个问题。是提供一个 `setLayerColor`，还是再提供 `setAllMatchingLayersColor`？筛选条件能不能嵌套？批量修改失败到一半怎么办？随着需求变复杂，tool schema 很容易慢慢长成一门不太好用的编程语言。

那不如真的给它一门编程语言。

这也并不意味着 programmable runtime 要和 MCP 打擂台。`run_javascript({code})` 自己就是一个 tool，完全可以通过 MCP 暴露。更准确的区别是：一种接口枚举 Agent 可以执行的动作，另一种接口提供一个环境，让 Agent 自己组合程序。

Anthropic 在 [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) 中也讨论了类似的问题：当 tools 变多、调用链变长时，可以把它们呈现成代码 API，让 Agent 在执行环境中按需加载、组合和处理结果。这样不仅能写循环和控制流，中间数据也不必每一步都经过模型的上下文。

这个思路放到网页里尤其自然。假如浏览器中有一万行 CSV，Agent 想筛选、分组后找出前十项，没必要先把一万行发给模型。程序可以留在本地完成计算，最后只 `log` 十行摘要。Browser Use 需要不断观察页面，细粒度 tools 需要不断传回结果，而一段程序有机会把许多中间步骤压缩在 runtime 内部。

我还没有认真 benchmark Maputnik-AI 到底能省下多少 token，所以这里不打算编一个漂亮的百分比。但少传很多无关页面状态、少让中间结果来回穿过 context、少进行几轮模型调用，这个节省机制至少是很直观的。

## 重要的是同一个 workspace

单纯让模型执行代码并不新鲜。Notebook、Coding Agent 和各种代码执行工具都能做到。Maputnik-AI 让我觉得更有意思的地方，是代码执行环境没有和应用分家。

用户刚把地图拖到上海，`map.getBounds()` 读到的就是上海；用户刚选中一个图层，`workspace.selectedLayer` 指向的就是它；用户手工把道路透明度调到 0.4，再说“其他道路也照这个感觉改”，Agent 可以从当前 style 接着工作。

这里没有“人使用的应用”和“Agent 生成结果的后台”两套世界，只有一个不断变化的 workspace：

```text
人直接编辑
    ↓
同一份 live state
    ↑
Agent 编写程序
```

Figma 最近的 [MCP 能力](https://developers.figma.com/docs/figma-mcp-server/) 也已经能读取选中的 frame，并让 Agent 把内容写回原生、可继续编辑的 canvas。我觉得这个方向比“AI 给我导出一张最终图片”有意思得多：Agent 不是一个躲在对话框后面交付成品的外包，而是进入用户正在工作的环境，修改同一份东西，然后把控制权交还给用户。

## 也不是所有网页都需要一个 REPL

如果网页只是登录、填写表单、购买商品，那么 Browser Use 或几个定义清楚的 tools 已经很好用。给“加入购物车”套上循环和高阶函数，除了增加安全问题，似乎也没有带来多少快乐。

Programmable runtime 更适合那些对象很多、内部状态很多、操作组合几乎无法枚举的应用：GIS、设计工具、BI、IDE、科学模拟器。它们通常本来就有不错的底层 API，用户也经常提出开发者没有提前做成按钮的操作。

当然，直接执行模型生成的 JavaScript 非常危险。Maputnik-AI 当前确实是用 `new Function` 在页面上下文中执行代码，没有沙箱，只适合作为可信模型、可信数据和可信环境下的 prototype。真的把这种能力做成基础设施，至少还需要 capability 限制、超时、preview、transaction 和 undo。程序一次可以完成很多操作，也意味着它可以一次犯很多错误。

不过这些更像是“怎样把它做安全”的问题，而不是“这种接口有没有价值”的问题。

现代复杂网页其实早就有两张脸：一张是用户看到的 GUI，另一张是开发者使用的对象模型和 library API。过去 scripting API 只对会编程的高级用户有用；LLM 出现以后，自然语言突然可以成为它的入口。

所以我越来越觉得，未来的 Agent 不一定只是在网页外面看着截图、努力学会怎样使用软件。它也可以进入网页正在运行的 runtime，拿到真实对象，写一小段程序，然后和人一起继续编辑同一个世界。
