---
title: vue3-fastapi 简易开发体验
date: 2022-03-01 14:20:02
tags: [vue, fastapi, web, 异步, js]
category: web
mathjax: true
tocbot: true
---

温故而知新，本文将借助比较现代化的开发流程（vue-cli, vue3, fastapi）重构之前的一篇简易备忘系统

<!-- more -->

## 前端

前端借助 Vue CLI 搭建起 Vue 项目，并对原先内容进行迁移

```bash
vue create hello-world
```

后即可修改 Vue 项目

### Vue

在介绍 Vue3 之前，首先需要介绍一下 Vue 框架的基本思想。

原先，DOM (html 文档) 中显示的数据和 js 中的变量并没有绑定关系，因此，每次变量改变（包括从后端获取数据）都需要重新操作 DOM, 更新数据

Vue 对此进行了简化，这是怎么做到的呢？

从逻辑上来说，设 State 是当前所有应用（网页）中所有数据的集合，View 是用户看到的 ui 界面，它们之间应该具备一个单向的函数关系 $View = f(state)$

Vue 所做的工作即为自动描述了这一函数关系，使得 html 文档中显示的元素可以通过 Vue 提供的模板语法 `{{ }}` 与 State 中的变量进行绑定，比如如果我想在页面某处显示脚本中的值 `x`，那 html 对应位置直接写 `{{ x }}` 即可。加上 Vue 提供的 `v-if` 和 `v-for` 之类的模板控制流，使得用户可以专注于数据的操作，而无需担心这些数据怎样更新到页面上

具体实现上，Vue2 采用 `data、computed、methods、watch` 等组件，被称为响应式 API：

- data 即为 $State$ 集合，包含了所有该页面需要用到的数据
- methods 是一些方法（函数）的集合，可以用于处理页面点击事件，更新数据等
- computed 为计算属性，可以理解一个语法糖（当然，具体实现上不是语法糖）。如果页面上一个元素的内容 $a$ 依赖数据 $x$, 具体关系为 $a = f(x)$, $f$ 是一个很复杂的函数，直接写模板 `{{ f(x) }}` 既麻烦又表意不明，这个时候可以设置计算属性 $y = f(x)$，即可通过 `{{ y }}` 达到自己想要的效果
- watch 用于自动检测页面上元素的变化，可以在检测到用户的操作之后调用相应的 methods 中的函数

### 组合式 API

Vue2 在功能上已经很完善，但是一个很大的弊端是如果不注意拆分组件（页面），一个组件文件可能会非常长，甚至上千行。试想一个界面内有很多元素，每个元素都有对应的数据和用户操作界面的方法，那么 `data、computed、methods、watch` 中会有页面里不同模块的内容混杂，一方面可读性较差，另外一方面太长的文件也不方便编辑。

对此，Vue3 相对于原先的响应式 api，引入了组合式 api，目的就是为了将操作页面中同一模块的 js 逻辑整合到一起。

`data、computed、methods、watch` 在这一改变后被统合到了一个 `setup` 组件。

先看一下重构之后的备忘系统前端逻辑：

```html
<script setup>
  import { inject, onMounted, ref } from "vue";

  const axios = inject("axios"); // 用于前后端通信

  const notes = ref([]);
  const add_note = ref("");
  const url = "....../notes"; // 调用的接口

  const getNotes = async () => {
    const resp = await axios.get(url);
    notes.value = resp.data;
  };

  const addNote = async () => {
    await axios.post(url, {
      create_time: new Date().toLocaleString(),
      content: add_note.value,
    });
    add_note.value = "";
    getNotes();
  };

  const deleteNote = async (id) => {
    await axios.delete(url + `/${id}`);
    getNotes();
  };

  onMounted(getNotes);
</script>
```

再来逐个部分解析。

#### 前后端通信

首先是三个前后端通信的接口，这里先忽略 `async` 只要知道它们能请求数据即可。

```html
<script setup>
  import { inject, onMounted, ref } from "vue";

  const axios = inject("axios"); // 用于前后端通信

  const notes = ref([]);
  const add_note = ref("");
  const url = "....../notes"; // 调用的接口

  const getNotes = async () => {
    notes.value = 请求到的笔记数据;
  };

  const addNote = async () => {
    请求后端增加笔记;
    add_note.value = "";
    getNotes();
  };

  const deleteNote = async (id) => {
    请求后端删除指定笔记;
    getNotes();
  };

  onMounted(getNotes);
</script>
```

#### 数据绑定

接下来讨论一下 $View = f(state)$ 如何实现。

主要实现方法是 `ref`，这是为了给指定的数据创建引用。为什么要创建引用以及引用的使用可以参见官方 [组合式 API 文档](https://v3.cn.vuejs.org/api/composition-api.html), 这里注意组合式 API 是兼容原先响应式 API 的， `<script setup>` 是一个特殊的语法糖，所以也需要按照文档说明，创建引用，实现数据绑定

```html
<script setup>
  import { inject, onMounted, ref } from "vue";

  const axios = inject("axios");	// 用于前后端通信

  const notes = ref([]);
  const add_note = ref("");
  const url = "....../notes";	// 调用的接口

  const getNotes = ...		// 后端返回所有笔记

  const addNote = async () => {
    请求后端增加笔记;
    清空用户输入;
    请求后端返回所有笔记;
  };

  const deleteNote = async (id) => {
    请求后端删除指定笔记;
    请求后端返回所有笔记;
  };

  onMounted(getNotes);
</script>
```

#### 钩子

再来看 `onMounted(getNotes);` 这一行。Vue 提供了一些特殊的钩子，`onMounted` 代表组件加载完毕后会执行的语句。这里我们希望组件加载完成后直接加载所有笔记数据。关于钩子，是 Vue 的一个重要特性，本文不在此讨论。

```html
<script setup>
  import { inject, onMounted, ref } from "vue";

  const axios = inject("axios");	// 用于前后端通信

  const notes = ref([]);
  const add_note = ref("");
  const url = "....../notes";	// 调用的接口

  const getNotes = ...		// 后端返回所有笔记

  const addNote = async () => {
    请求后端增加笔记;
    清空用户输入;
    请求后端返回所有笔记;
  };

  const deleteNote = async (id) => {
    请求后端删除指定笔记;
    请求后端返回所有笔记;
  };

  页面加载完后请求后端返回所有笔记;
</script>
```

#### 页面模板

至此，前端的逻辑就基本分析完毕。下面考虑页面模板的编写：

```html
<ul>
  <div v-if="!notes">暂无数据</div>
  <li
    v-for="(note, i) in notes"
    :key="note.create_time"
    style="overflow: hidden"
  >
    {{ note.content }}
    <button style="float: right" @click="deleteNote(i)">删除</button>
    <span style="float: right">{{ note.create_time }}</span>
  </li>
  增加备忘：<input v-model="add_note" />
  <button @click="addNote">提交</button>
</ul>
```

可以看到 `v-if` 和 `v-for` 的方便之处。

#### 补充：异步

异步名字看起来很高大上，但原理没有这么复杂。本质就是因为浏览器对某个接口的请求可能会耗费较长的时间（比如我们用 js 下载一个文件，可能需要好几秒），这个期间我们希望 js 能继续执行。因此，我们需要一个 **回调函数** ，在接口请求完成后继续执行这个回调函数，来完成与后端接口通信结束之后的处理。

举例来说，逻辑大致是这样：

```javascript
func1 = ...
func2 = ...
func3 = ...
func4 = ...

func1()

fuc2(请求的 url 和相关参数，func3)

func4()
```

实际执行中，func1 执行完后来到了一个请求后端接口的函数 func2，func2 在请求后端数据的同时，js 的运行并不会阻塞，而是会继续从 func4 往后执行。直到请求完成，才会执行 func3（比如用于处理得到的数据）

async/await 是对以上的异步过程的简化。这里我们不去阐述 js 的 Promise 机制，而单从使用上理解：对于一个异步函数（比如调用后端接口），我们可以用 await 来 "等待" 这一函数调用完毕。await 之后的内容起到了与回调函数类似的作用，会在异步函数调用完后再执行。

比如以下代码（这并不实际生效，下面再解释）

```javascript
function foo() {
  const resp = await axios.get(url); // GET 请求的结果会被存在 resp 中
  // 接下来可以处理 resp
}
```

但注意的是，`foo` 调用了一个异步函数，所以 `foo` 的执行会消耗较长时间，于是它也变成了一个异步函数。为了标识这一点，我们给 `foo` 注明 `async`

```javascript
async function foo() {
  const resp = await axios.get(url); // GET 请求的结果会被存在 resp 中
  // 接下来可以处理 resp
}
```

`foo` 是一个异步函数，所以也可以再写一个异步函数处理 `foo` 返回的数据：

```javascript
async function bar() {
  const res = await foo();
  // 接下来处理 res
}
```

若调用 `bar`，实际会依次执行 `axios`, `foo`, `bar` 中的逻辑，但是我们的代码中并没有出现嵌套，使得异步代码看起来与同步代码类似，很清爽

## 后端

本文采用 uvicorn + fastapi 在服务器上部署。部署具体可以参考 fastapi 文档。

```bash
pip install fastapi
pip install uvicorn[standard]
vim main.py
uvicorn main:app --host 0.0.0.0 --port 80	# for example
```

fastapi 官方文档的说明非常清楚，直接贴代码：

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel


class Note(BaseModel):
    content: str
    create_time: str


app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"],
                   allow_headers=["*"],)

notes = []


@app.get("/notes")
def read_notes():
    return notes


@app.post("/notes")
def append_note(note: Note):
    notes.append(note)
    return notes[-1]


@app.delete("/notes/{id}")
def delete_note(id: int):
    return notes.pop(id)

```

这一行是用来设置跨域

```python
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"],
                   allow_headers=["*"],)
```

`@app.get("/notes")` 代表使用 `GET` 访问 `/notes` 接口时会调用的函数。这里介绍几个常见的访问接口的方式：

- GET: 获取信息
- POST: 添加信息
- PUT: 添加/更新信息，需要保证调用 n 次和调用 1 次的结果相同，因此常用于更新数据
- DELETE：删除数据

## 画饼

啥时候用 Vue3 + fastapi 把自己博客重构一遍（）
