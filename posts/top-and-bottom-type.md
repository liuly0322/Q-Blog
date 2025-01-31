---
title: 一次类型体操 & TypeScript 中的特殊类型
date: 2024-03-13 17:33:33
tags: [类型系统, typescript]
category: web
---

接上篇文章，我们在实现了 APlayer 的 Tree-Shaking 之后，遇到了一个新的问题：我们成功为播放器的某些功能拆分出了对应的插件，通过 `APlayer.use(plugin)` 的方式进行加载。但是有的插件会为 `APlayer` 注入新的方法，我们希望在加载插件后能够正确的提示出这些方法；并且在不加载插件的时候，不会提示出这些方法。即，`use` 操作需要返回一个新的 `APlayer` 类型，这个类型包含了插件注入的方法。

本文先介绍一下这个功能的实现，然后再讨论一下 TypeScript 中的 `unknown`, `never`, `void` 和 `any` 等特殊类型。

参考：

- （推荐阅读）简单科普底类型（Bottom Type）、单元类型（Unit Type）以及顶类型（Top Type）：<https://zhuanlan.zhihu.com/p/677605002>
- （官方）TypeScript: Type Compatibility：<https://www.typescriptlang.org/docs/handbook/type-compatibility.html#any-unknown-object-void-undefined-null-and-never-assignability>

<!-- more -->

## 功能实现

首先，插件是一个接收 `APlayer` 类型的参数的函数，它会在 `APlayer` 上注入一些新的方法。我们可以通过 TypeScript 的泛型来表示这个插件：

```typescript
type Plugin<P> = (player: APlayer) => void;
export const APlayerFixedModePlugin: Plugin<unknown>;
export const APlayerHlsPlugin: Plugin<unknown>;
export const addMusicPlugin: Plugin<{
  list: {
    add: (audios: Audio[] | Audio) => void;
  }
}>;
```

不难想到 `APlayer` 类型也应该是一个泛型：

```typescript
export type APlayer<T = unknown> = {
  init(options: APlayerOptions): APlayer<T>;
  use<P>(plugin: Plugin<P>): APlayer<T & P>;
  play(): void;
  // ... other methods
} & T
```

每次 `use` 操作都将插件提供的类型 `P` 与当前 `APlayer` 的泛型参数 `T` 进行合并。通过 `APlayer<T> = {...} & T` 的方式，我们将 `APlayer` 自带方法的类型与插件提供方法的类型进行了合并。

这里功能已经实现了，但还遗留了一些问题：

- 这里泛型的默认值为什么选择了 `unknown`？
- `APlayer` 的泛型参数 `T` 与 `P` 的合并操作是什么意思？

后文继续讨论。

## TypeScript 中的特殊“空”类型

### 概念：AnyScript

相信大家都看过那张 JavaScript 的各种 falsy 值相互之间是否 `==` 相等的表格 meme，现在 TypeScript 出现了，“空”类型更多了（x

先明确一些重要的概念：

- 子类型几乎可以看成是一种 `assignable to` 的关系，即 `A` 是 `B` 的子类型几乎等价任何需要 `B` 类型值的地方都可以使用 `A` 类型的值。
- `any` 类型是特例，可以赋值给任何类型（除 `never`）或者被任何类型赋值。相当于 TypeScript 开的一个后门，后文不再考虑。

嘛，毕竟赋值/隐式类型转换就是我们最常见的操作。在不考虑 `any` 之后，子类型关系就形成了一个链条，如果 `A` 是 `B` 的子类型，`B` 是 `C` 的子类型，那么 `A` 也是 `C` 的子类型。这种关系叫做偏序关系。

### 类型即集合

我们可以进一步形式化这一偏序关系：

- 考虑每个类型都对应一个由它的所有可取值组成的集合，那么 `A` 是 `B` 的子类型，就意味着 `A` 的集合是 `B` 的集合的子集。
  - 这等价于 `assignable to` 关系成立。
- 类型的 Intersection 和 Union 操作，就是对应可取值集合的交和并操作。

听起来还是有点抽象，我们举几个例子：

```typescript
// 第一种情况：B 是 A 的子类型
type A = { a: number };
type B = { a: number, b: string };

// 第二种情况：A 是 B 的子类型
type A = 'a';
type B = 'a' | 'b';
```

好像看起来更抽象了：为什么同样是 `B` 的范围看起来比 `A` 更广，但是一种情况下 `B` 是 `A` 的子类型，另一种情况下 `A` 是 `B` 的子类型呢？

一方面可以用最基本的 `assignable to` 概念判断。第一种情况中，任何需要 `A` 类型的地方都可以用 `B` 类型的值来代替，因为 `A` 要求具备 `a: number` 属性，而 `B` 满足这一要求。第二种情况同理判断任何需要 `B` 类型的地方都可以用 `A` 类型的值来代替。

另一方面，我们也可以用集合的观点来看待问题。第二种情况此时就变得非常显然了，`type B = A | 'b'`，这是集合的并运算，所以 `A` 是 `B` 的子集（子类型）。问题是怎么理解第一种情况中 `B` 是 `A` 的子集（子类型）呢？我们重新表示第一种情况的代码：

```typescript
type A = {
  a: number;
  b?: any;
  c?: any;
  [any_string_here]?: any
  ...
}

type B = {
  a: number;
  b: string;
  c?: any;
  [any_string_here]?: any
  ...
}
```

注意 TypeScript/JavaScript 的结构体本身是一个对象，所以其实隐含了所有其他未被注明的属性都是可选的。这么一看，`B` 可取值集合显然是 `A` 的子集了，因为 `A` 没有对 `b` 属性做出要求：`A` 的可取值相当于 `[number, any, any, ...]`，而 `B` 的可取值相当于 `[number, string, any, ...]`。可以想象，不同结构类型的 Intersection 运算就是将所有注明的属性取交集，所得结果也会是任意原来类型的子类型。到这里，上文遗留的第二个问题已经解决了。

### unknown, never, void

理解了类型和集合的对应之后，我们终于可以解决遗留的第一个问题，开始讨论 TypeScript 中的 `unknown` 和 `never` 了。

- 空集是所有集合的子集。对应 `never` 是所有类型的子类型。因此 `never` 又叫底类型。
- 任何类型都是 `unknown` 的子类型，因此 `unknown` 又叫顶类型。

`unknown` 类型相当于没有任何约束，任何值都是 `unknown` 类型。所以，在我们对插件一无所知的时候，可以使用 `APlayer<unknown>` 类型。随着增加新的插件 `Plugin<P>`，我们会有 `APlayer<unknown & P> = APlayer<P>`（`unknown & P = P` 是顶类型，或者说全集具有的性质）。

从集合的角度，我们还可以发现，空集的大小为 0，所以 `never` 没有实例。因此，它可以表示一个函数永远不会返回值（死循环或异常），或者一个变量永远不会被赋值。

```typescript
let bar: never = (() => {
  throw new Error('Throw my hands in the air like I just dont care');
})();
```

一个函数除了正常情况（有特定返回值）和永远不返回（`never`）之外，还可能我们并不关心它的返回值。通常这可以通过什么都不返回实现（其实是返回 `undefined`）。

```typescript
type f = () => void;
let a: f = () => {};
let b: f = () => 1;
```

注意不关心（不使用）返回值不等于没有返回值。这就是 `void` 类型的特殊性，在一个标注为需要返回值 `void` 的函数的地方，我们使用返回值为任意值的函数都是可以的（如上面的 `b`）。
