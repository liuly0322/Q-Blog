---
title: 当 Agent 开始编程正在运行的网页
date: 2026-08-28 12:00:00
tags: [AI, GIS, JavaScript, MCP]
category: web
---

> 本文含有约 20% 的 AI 文字。

现在 Agent 和 Browser Use 很火，但如果你真的使用过，就会发现它完成任务的效率还是很低下。但等等，对于网页，我们明明一直有更高效的交互方式：不如让 Agent 直接运行 JavaScript 代码吧！

这几天我搓了一个 [Maputnik-AI](https://github.com/liuly0322/Maputnik-AI)。它是地图样式编辑器 [Maputnik](https://github.com/maplibre/maputnik) 的一个实验性分支：导入一份 CSV，再告诉 Agent 想画成什么样，它就会直接修改眼前这张 MapLibre 地图。

![Maputnik-AI Agent 工作区](./programming-live-webpage/20260828-agent-workspace.webp)

<!-- more -->

比如让它把热点数据画成绿色方格，按数值调整深浅，同时简化底图，得到的是下面这张还能继续编辑的地图：

![Agent 生成的方格地图](./programming-live-webpage/20260828-agent-generated-grid-map.webp)

项目本身可以在 [在线 Demo](https://liuly.moe/Maputnik-AI/) 里玩（需要自备支持 Responses API 的 API Key），我们来对比它相对于 Browser Use 或者 MCP 的好处。

## Browser Use

现在让 Agent 操作网页，最直接的办法当然是 Browser Use。Agent 看截图、DOM 或 accessibility tree，找到输入框和按钮，然后 click、type、scroll，再观察页面有没有发生预期的变化。

这套方式的好处是通用。但如果应用有一些非原生的控件，模拟操作本身可能就会很费时费力。比如说，Maputnik 有一个可以拖拽的图层列表，用来移动图层。如果模拟点击和移动，Agent 初版可能会生成这样的代码：

```javascript
const from = document.querySelector('[data-wd-key="layer-list-item:fantasy:buildings"]');
const to = document.querySelector('[data-wd-key="layer-list-item:fantasy:towns"]');
const r = to.getBoundingClientRect();

from.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
to.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: r.x, clientY: r.y }));
to.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
```

看起来很好很简单，点下去移动过去释放。但是**它不工作**。

当然经过一些迭代 Agent 最后会发现这个列表是 dnd-kit 的 sortable，然后用很鬼畜的多达 77 行代码完成任务：

```javascript
(async () => {
  const source = document.querySelector(
    '[data-wd-key="layer-list-item:fantasy:buildings"]'
  );
  const target = document.querySelector(
    '[data-wd-key="layer-list-item:fantasy:towns"]'
  );

  if (!source || !target) {
    throw new Error('source / target layer not found');
  }

  const handle = source.querySelector('.maputnik-layer-list-item-handle');

  const from = handle.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const startX = from.left + from.width / 2;
  const startY = from.top + from.height / 2;

  const endX = to.left + to.width / 2;
  const endY = to.top + to.height / 2;

  const pointerId = 1;

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const fire = (type, x, y, target) => {
    target.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId,
      pointerType: 'mouse',
      isPrimary: true,
      clientX: x,
      clientY: y,
      button: 0,
      buttons: type === 'pointerup' ? 0 : 1,
    }));
  };

  // 1. 按下
  fire('pointerdown', startX, startY, handle);

  // 模拟人按下鼠标之后稍微停一下
  await sleep(150);

  // 2. 平滑移动
  const duration = 800;
  const steps = 40;
  const interval = duration / steps;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;

    // easeInOut
    const p = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const x = startX + (endX - startX) * p;
    const y = startY + (endY - startY) * p;

    const el = document.elementFromPoint(x, y) || document.body;

    fire('pointermove', x, y, el);

    await sleep(interval);
  }

  // 到达目标以后稍微停一下
  await sleep(200);

  // 3. 松开
  const el = document.elementFromPoint(endX, endY) || document.body;
  fire('pointerup', endX, endY, el);
})();
```

嗯……你看到这么多代码在刷屏一定已经开始不耐烦了。还好 Agent 是大模型在看代码。

那么同样的效果，如果我们使用 MapLibre 的 API 完成：

```javascript
map.moveLayer('fantasy:buildings', 'fantasy:towns');
```

啊！太让人感动了。

下面我们看看怎么实现。

## 暴露浏览器 JS 环境

项目给模型注册的核心 tool 其实只有一个：

```text
run_javascript({ code })
```

这段 JavaScript 执行时，可以直接访问：

```js
map        // 正在显示的 MapLibre Map
datasets   // 浏览器本地导入的 CSV 数据
```

`map` 就是 MapLibre 原生的实例，`map.getStyle()`、`map.setStyle()` 这些方法都能直接用。代码的返回值就是 tool 的结果。

于是 Agent 可以写这样的代码：

```js
const ds = datasets.get("<dataset id>");
const {columns, rows} = ds.data;
const valueIndex = columns.indexOf("value");
const values = rows.map(row => Number(row[valueIndex])).filter(v => v > 0);
const max = Math.max(...values, 1);

const nextStyle = map.getStyle();
for (const layer of nextStyle.layers) {
  if (layer.type === "symbol") {
    layer.layout = {...layer.layout, visibility: "none"};
  }
}

const sourceId = `agent-dataset:${ds.id}`;
nextStyle.sources[sourceId] = {
  type: "geojson",
  data: datasets.csv.toGeoJSON(ds, {
    type: "Point",
    coordinates: ["lon", "lat"],
  }),
};
nextStyle.layers.push({
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
map.setStyle(nextStyle);

return {rows: rows.length, max};
```

筛选、求最大值、遍历图层、修改样式、创建数据图层，都在一次执行里完成。传统 MCP 可能要把它拆成 `hide_label`、`get_next_layer`、`calculate_max`、`add_circle_layer` 几个工具，让模型分多轮完成。虽然模型实际上可以一轮调用多个工具，但如果有数据依赖就没办法合并了。此时能直接执行代码的组合性优势也体现出来了。

## MCP 和 PTC

Browser Use 只能在表现层猜应用内部发生了什么，MCP 或普通 tool calling 则已经提供了可靠的接口。Chrome 最近推进的 [WebMCP](https://developer.chrome.com/docs/ai/webmcp) 就是这个方向：网页可以用 JavaScript 主动声明 tools，让 Agent 理解每个操作的目的。

但额外维护一套 schema 其实未必轻松：一方面是接口定义，我们要不要提供 batch、filter 操作？另一方面是随着应用变复杂，维护成本也会上升。不如直接把应用底层对象暴露出来让 Agent 自己写 JS 操作了。

其实引入代码执行这个想法并不新鲜。Anthropic 叫它 programmatic tool calling（PTC）。它的好处一方面是组合性：模型不再顺序发 tool call，而是自己写一段代码，引入了控制流，一次执行可以调用多个 tool。

另一方面是省 context：代码跑完只有最终结果回到上下文里。假如浏览器里有一万行 CSV，Agent 想筛选、分组后找出前十项，没必要先把一万行发给模型，程序可以直接在本地算完，只返回十行摘要。

改造之后的 Maputnik 天然具备了上面的好处，同时也不需要写一大堆 tool 的兼容性 schema 和 bridge 代码。真正要做的只是把应用自己的对象和接口交给模型，`map` 和 `datasets` 本来就是这个页面里的 JavaScript 对象。

另外注意到在浏览器里，页面本来就是一个 JavaScript 环境，代码执行直接 `new Function` 跑就好了。轻轻又松松啊。

## 后话

如果网页只是登录、填写表单、购买商品，那么 Browser Use 或几个定义清楚的 tools 已经很好用。给“加入购物车”套上循环，只会多出安全问题。

Programmable runtime 更适合那些对象很多、内部状态很多、操作组合几乎无法枚举的应用：GIS、设计工具、BI、IDE、科学模拟器。它们通常本来就有不错的底层 API，用户也经常提出开发者没有提前做成按钮的操作。

当然，直接执行模型生成的 JavaScript 非常危险。Maputnik-AI 现在就是用 `new Function` 在页面上下文中执行代码，没有沙箱，只适合作为可信模型、可信数据和可信环境下的 prototype。这一点倒是和 coding agent 面对的处境很像：都是直接执行模型写的代码，只能靠可信环境和事后审查来保证安全。

现代复杂网页都有两层：用户看到的 GUI（表现与交互），和程序对象模型与 API（数据与逻辑）。过去 scripting API 必须要先会编程才能使用，而且有开发成本。LLM 出现以后，自然语言也成了它的入口。

未来的 Agent 不一定只是在网页外面看截图、学着操作软件，它也可以进入网页正在运行的 runtime，拿到真实对象，写一小段程序，和人一起编辑同一个世界。
