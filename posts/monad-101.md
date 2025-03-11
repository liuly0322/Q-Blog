---
title: Monad 101
date: 2024-06-01 01:17:20
tags: [函数式编程, typescript]
category: web
---

一份 Monad cheat sheet.

> 以前在别人的一篇 blog 里看到过有这样一句话，大意是：关于 monad，几乎每个在学习函数式编程中接触到这个模式的，都会写一篇博客描述他的理解。而且不同的人对 monad 的理解有所不同（暗讽 monad 的复杂）。

所以咱也来写一份！尽管 Monad（单子）是一个来源于范畴论的概念（在范畴论中它被定义为「自函子范畴上的幺半群」），若没有接触过范畴论可能会觉得这份定义很难理解，然而在实际编程中，我们只需要数行代码就可以构造出「幺半群」、「函子」和「单子」。

本文将首先用 TypeScript 构造出「幺半群」、「函子」和「单子」及相关示例，然后再（尝试）解释这些概念。因为我们只需要在「程序语言的类型」这一具体语境下使用范畴论的一些概念，所以这里的「范畴论知识」也某种程度上被特化了，我们不会涉及到范畴论中的全部抽象。

<!-- more -->

参考：

- 我所理解的 monad 系列：<http://hongjiang.info/understand-monad-0/>
- 上文的一个整理版本：<https://chengchaos.github.io/2019/01/08/monads-and-monoids-notes.html>
- 怎么理解“一个单子（Monad）说白了不过就是自函子范畴上的一个幺半群而已”? - chris 的回答 - 知乎：<https://www.zhihu.com/question/282666729/answer/508110678>
- 十分钟魔法练习 - 玩火：<https://magic.huohuo.moe/>

## 幺半群（Monoid）

幺半群是一个代数结构。用代码来说明：

```typescript
function Product<T>(x: T, y: T) {
  // 具体实现
  return x * y
}
function getIdentityElement<T>(): T {
  // 具体实现
  return 1
}
```

它对应这样的代数结构要求：

给定集合 $T$：

- 有一个二元运算 $*: T \times T \to T$
- $*$ 满足结合律：$(a * b) * c = a * (b * c)$
- 有一个单位元素 $1 \in T$，使得对于任意 $a \in T$，$a * 1 = 1 * a = a$

在这里，`Product` 就是「二元运算」，`getIdentityElement` 就是得到一个「单位元素」。可以验证上面的例子满足结合律和单位元素的要求。

> `Monoid<T>`?
>
> 读者在别的地方可能会看到幺半群的另一种实现：通过 `Monoid<T>` 定义一个类，然后给它定义一个 `concat` 方法以实现二元运算。然而类的属性调用毕竟只是一个语法糖，考虑到引入额外的类/对象可能会增加理解的难度，这里我们直接定义了一个函数 `Product`。

乘法运算显然是满足结合律且具备单位元素的。同理，自然数集上的加法运算、字符串的拼接等都是幺半群。所以我们可以替换 `Product` 和 `getIdentityElement` 的内部实现：

```typescript
// 加法
function Product(x: number, y: number) {
  return x + y
}

function getIdentityElement() {
  return 0
}

// 字符串拼接
function Product(x: string, y: string) {
  return x + y
}

function getIdentityElement() {
  return ''
}
```

要求「二元运算」具备结合性有什么好处呢？读者可能已经知道矩阵的快速幂算法，这个算法的核心就是利用了矩阵乘法的结合性。幺半群的结合性保证了我们可以任意计算问题的子结构，然后将子结构合并。

快速幂算法是一种对 `Product` 运算的调度，然而更一般地，我们有 `reduce` 方法表示顺次对一个数组中的元素进行 `Product` 运算（最平凡的调度方法）：

```typescript
function reduce<T>(
  arr: T[],
  Product: (x: T, y: T) => T,
  identityElement: T
): T {
  let result = identityElement
  for (const x of arr) {
    result = Product(result, x)
  }
  return result
}
```

`reduce` 函数指出了 `identityElement` 的重要性：如果数组为空，那么 `identityElement` 就是 `Product` 运算的结果。这保证了对任意长度的数组都可以进行 `reduce` 运算。

稍作拓展也可以用于流的计算，考虑布尔值上的或运算也是一个幺半群，而且只要遇到 `true` 就可以停止计算，返回 `true`。因此对于一个 `false x false x true x ...` 的流，我们可以稍微修改 `reduce` 函数，使得遇到 `true` 就直接返回，这就实现了「短路」。

## 函子（Functor）

> 参考：《类型论简史》- Trebor\
> CC BY-NC-SA 4.0 DEED\
> <https://github.com/Trebor-Huang/history>

单子的定义是「自函子范畴上的幺半群」，「范畴」可以简单理解成一个集合，这个集合的每个元素都是一个「对象」。对于每对对象 $A$ 和 $B$，又存在一个集合 $hom(A, B)$，可以简单定义成：$hom(A, B) = \{f\ |\ f: A \to B\}$，即从 $A$ 到 $B$ 的所有函数。

换句话来说，「范畴」就是在研究一类对象和它们之间的关系。对于程序语言，「对象」$A$, $B$ 就是类型 `type A; type B`，而 $hom(A, B)$ 就是 `type Hom<A, B> = (a: A) => B`，即从 $A$ 到 $B$ 的所有函数，又叫 $A$ 到 $B$ 的态射。

这么定义有什么好处呢？读者可能已经很熟悉数学上的罗素悖论，即「所有集合的集合」这个概念会引入矛盾。在数学中我们研究的对象往往是分层次的，例如我们会讨论实数 $r \in \mathbb{R}$，而不会讨论 $\mathbb{R} \in \mathbb{R}$，或者我们可能希望讨论一些实数集合构成的集合族。注意这些数学对象间具备的层次性。事实上，层级混乱的命题也一般没有数学意义。

范畴对讨论的对象的层次进行了限制，（当前）我们讨论的对象，即「类型」，都处于同一层次，都是某个具体的数据类型，如 `int, List<int>, List<List<int>>`。之所以要强调这一点，是因为「类型」也可以看成有「类型」，类型的类型一般称为 kind。例如 `List` 接受一个「具体类型」，输出一个「具体类型」，所以 `List` 的 kind 是 `Type -> Type`。限制在「具体类型」这一层后，我们就不必讨论 `List` 这种类型构造子，及其他更高阶的对象。

> 类型论中标准的记号：
>
> - $*$: （普通的）数据类型，proper types。如 `int, List<int>`；
> - $* \to *$: （一元的）类型构造子，type constructors。如 `List`；
> - $* \to * \to *$: （二元的）类型构造子，如 `Map`；
> - $(* \to *) \to *$: 高阶类型构造子，输入一个一元的类型构造子，输出一个数据类型。又称 HKT（Higher-Kinded Type）。

> HKT 的作用（[参考文章](https://www.zhihu.com/column/p/29021140)）：
>
> ```rust
> struct Collection<C<_>> {
>     data: C<i32>
> }
> ```
>
> 使用的时候，我们可以这样指定泛型参数 `Collection<Vec>`, `Collection<LinkedList>`，就可以更换内部数据存储的实现方式。

到目前为止，我们只研究了全体「具体类型」为对象的这一个范畴。下文我们把这个范畴记作 $U$。

定义：

- 函子是范畴间的映射，$F: C \to D$
  - 把每个对象 $T \in C$ 映射到 $F(T) \in D$
  - 把每个态射 $f: T_1 \to T_2 \in C$ 映射到 $F(f): F(T_1) \to F(T_2) \in D$
  - $F(\text{id}_T) = \text{id}_{F(T)}$
  - $F(g \circ f) = F(g) \circ F(f)$
- 自函子是把一个范畴映射到自身的函子，$F: C \to C$

好，我们把这一长串定义体现在「具体类型」 $U$ 这个范畴上。首先，自函子的「映射到自身」是最好理解的，显然 `List` 把 `T` 打到 `List<T>`，也是一个具体类型，自然满足 $List: U \to U$。

下面我们写成代码，看看 `List` 是不是满足函子作为 $U \to U$ 的映射的几个条件：

```typescript
type Hom<A, B> = (a: A) => B
type List<T> = T[]

function id<T>(x: T): T {
  return x
}

function fmap<A, B>(f: Hom<A, B>): (list: List<A>) => List<B> {
  return (list: List<A>) => list.map(f)
}

// 验证恒等态射
// a: (List<number>) => List<number>;
let a = fmap(id<number>)
// b: (List<number>) => List<number>;
let b = id<List<number>>

// 验证复合态射
function f(x: number): string {
  return x.toString()
}
function g(x: string): number {
  return x.length
}
// c: (List<number>) => List<number>
let c = (x: List<number>) => fmap(g)(fmap(f)(x))
// d: (List<number>) => List<number>;
let d = fmap((x: number) => g(f(x)))
```

回顾函子的性质：

- `List` 把某个具体类型 `T` 映射到 `List<T>`；
- `fmap` 把某个函数 `f: A => B` 映射到 `fmap(f): List<A> => List<B>`；
- `fmap(id<T>) = id<List<T>>`，也就是 `fmap` 保留恒等态射；
- `fmap(g) ∘ fmap(f) = fmap(g ∘ f)`，也就是 `fmap` 保留复合态射。

这样我们就验证了 `List` 是一个 $U \to U$ 的自函子。

上面我们已经学习了幺半群的例子，我们发现利用幺半群的结合性可以在保证正确性的前提下优先计算某一部分子结构，加速计算。那么，定义一个自函子出来又有什么好处呢？

答案是：`fmap` 方法可以把一个函数 `f: A => B` 映射到 `fmap(f): F<A> => F<B>`，从而可以在 `F<A>` 上直接应用函数 `fmap(f)`，得到 `F<B>`，而不必取出 `F<A>` 内部的 `A` 计算后再放回去。这就是函子的一个重要性质。

## 单子（Monad）

### 再进一步？

在自函子的基础上，很多时候对一个 `F<A>` 类型，我们还希望有一些更方便的操作。比如用过 Rust 的 `Option` 类型的读者可能会对它的 `and_then` 方法很熟悉，它可以把一个函数 `f: A => Option<B>` 映射到 `and_then(f): Option<A> => Option<B>`。同理，这也达成了直接在 `Option<A>` 上应用函数 `and_then(f)`，而不必拆开 `Option<A>` 的效果。这么做可以很方便的把程序组合起来：

```rust
// 模拟用户提交的订单
let order = Some(Order {
    id: 1001,
    item: "Rust 编程指南".to_string(),
    quantity: 2,
});

// 使用 Option 的链式调用管理订单处理中的各个副作用
let processed_order = order
    .and_then(validate_order)    // 验证订单的正确性
    .and_then(check_inventory)   // 检查库存是否充足
    .and_then(process_payment)   // 处理付款
    .and_then(send_confirmation); // 发送确认邮件

match processed_order {
    Some(order) => println!("订单处理成功: {:?}", order),
    None => println!("订单处理失败"),
}
```

> `and_then` 在别的地方可能会叫做 `bind`。这只是名字上的差别，对于链式调用写成 `and_then` 更直观。

为了达成这个效果，就需要拓展自函子的功能。这就引入了 Monad。

> 除了提高程序组合性之外，Monad 还有助于处理副作用。例如读者可能已经熟悉 Haskell 中的 `IO` monad 以及 JavaScript 中的 `Promise`（虽然严格来说 `Promise` 不是 monad，但它很像）。

### Monad 的基本操作

如果我们根据已有的 `fmap`，尝试构造 `and_then`，会发现：

```typescript
function and_then<A, B>(f: Hom<A, List<B>>): (list: List<A>) => List<List<B>> {
  return (list: List<A>) => fmap(f)(list)
}
```

函数返回类型 `List<List<B>>`，而不是希望的 `List<B>`。这就启发我们，monad 应该能合并多层的 `List`。我们把这个方法叫做 `join`：

```typescript
// id 是恒等自函子
type id<T> = T

// id -> F
function unit<T>(x: id<T>): List<T> {
  return [x]
}

// F ○ F -> F
function join<T>(list: List<List<T>>): List<T> {
  return list.reduce((acc, x) => acc.concat(x), [])
}

// 可以用基本操作来实现 and_then
function and_then<A, B>(f: Hom<A, List<B>>): (list: List<A>) => List<B> {
  return (list: List<A>) => join(fmap(f)(list))
}
```

`unit`、`join` 和原先函子就具有的 `fmap` 共同构成了 monad 的基本操作。

可喜可贺，现在你已经知道 monad 是什么了……吗？等等：

- `unit` 和 `join` 没有像 `fmap` 一样给出需要满足的性质？
- 为什么要定义这个 `unit`？

下面我们就从数学角度搞定剩下的问题。

### 自然变换

`join` 函数的加入带来了一些有趣的变化：虽然受限于 TypeScript 的表达能力，必须写一个泛型参数 `T`，但抛开 `T` 不看，可以发现：`join` 把 `List` 和 `List` 复合映射到了 `List`。

`List` 和 `List` 的复合自然也是一个自函子，不难理解，它就是把 `T` 打到 `List<List<T>>`（其他条件读者可以自行验证）。换言之，`join` 把一个自函子映射到了另一个自函子。`unit` 也是类似的，它把 `id` 自函子映射到了 `List` 自函子。

我们要求，这一函子间的映射，应该使得态射间的复合得以保持（这就是函子间的自然变换的概念）。

还是以代码说明，$List \circ List$ 到 $List$ 的自然变换应该满足：

```typescript
let number_to_string = (x: number) => x.toString()

function fmap<A, B>(f: Hom<A, B>): (list: List<A>) => List<B> {
  return (list: List<A>) => list.map(f)
}

// List ○ List 是 List 自函子的复合
// 它的 fmap_ll 函数由 List 的 fmap 函数复合得到
function fmap_ll<A, B>(f: Hom<A, B>): (list: List<List<A>>) => List<List<B>> {
  return fmap(fmap(f))
}

// List ○ List -> List
function join<T>(list: List<List<T>>): List<T> {
  return list.reduce((acc, x) => acc.concat(x), [])
}

// 应该满足：join ○ fmap_ll(f) = fmap(f) ○ join
let x: List<List<number>> = [[1, 2], [3, 4]]
let left = join(fmap_ll(number_to_string)(x))
let right = fmap(number_to_string)(join(x))

console.assert(JSON.stringify(left) === JSON.stringify(right));
```

你可以在 [TypeScript Playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAEg9gWwDwEEA0UBCA+KBeKACgEMAuKFASn10wChRIoAZASwGdgkAVXA7gNoBdBuGisAJjz5RudOgBsIwKADsArggBGEAE4B9YHH2ddrVQHN8RAB7kN2vdTy4bAOiMBlYGcuFK8gBm6qoAxsCscKpQgQjEYKgYOISB5PDI6FjYlOSEChzA5GycqNk0LAVIOFAA3nRQULrK6rrReQVFlShlLlD5nG5xYCkBAL5BIeGR0bHx+goKiVkpaYhLODlE-YUVJcVc3T24+0gnOLh1DU3ALTNDKfeBlGPyAPSvuyqA06SfUAC0xwKdGCYQiUSgACs4OZpO1OJ09pVeNkEVxeLV6o1mq0+gU3E0JOpQhBCCRQqEMDZnLhiOS3KEoqFiMBCFSMMIXnR3lBACl6gFPowCHdoBm2MAWP9Q8xQH6zMDzBQjazS+U-cWqRTKKB2T6nSoOHS6bAyAQCACMGAATEJ2QBmDAAFiEIiUKiUgRUBBVDzmC0Iur0hmMpnMFkorOeapUZgsAAs3TF7r6DEYTD4gyGPVSAnQGap2HAlG5iOx2HoWQApTwAeQAcm5A5ZWIEQHkIK7nHgCOXq7WU-XG4RIzHngBuIA) 中验证代码。

代码说的事情就是，我们希望 `join` 这个 $List \circ List$ 到 $List$ 的映射能够保证，对一个 `List<List<T>>`，以下两种操作等价：

- 先整体应用某个操作（`fmap_ll`），再合并成一层（`join`）；
- 先合并成一层（`join`），再对每个元素应用某个操作（`fmap`）。

这样可以保证上面代码的 `left` 和 `right` 是相等的。同样的事情对 `unit` 也可以验证，对一个 `List<T>`，下面两种操作等价：

- 先再包装一层（`unit`），再整体应用某个操作（`fmap_ll`）；
- 先应用某个操作（`fmap`），再再包装一层（`unit`）。

### 定义 Monad

理解了自然变换后，可以得到 monad 的定义：

$U$ 范畴上的单子就是函子 $F: U \to U$，连同两个自然变换：
- $\text{unit}: \text{id} \to F$，对应函数 $\text{unit}_a: \text{id}(a) \to F(a)$
- $\text{join}: F \circ F \to F$，对应函数 $\text{join}_a: F(F(a)) \to F(a)$

我们要求这些自然变换满足一些性质。直观感受：

- 对于 `List<List<List<T>>>`，先对内层应用 `join`，再应用 `join`，应该等于先对外层应用 `join`，再应用 `join`；
- 对于 `List<T>`，先应用 `unit`，再应用 `join`，应该不变；
- 对于 `List<T>`，先应用 `fmap(unit)`，再应用 `join`，应该不变。

不变换言之就是恒等变换，这是 $F$ 到 $F$ 之间天然存在的。我们把它记作 $1_F$。

写成定义：

- $\text{join}_a \circ \text{fmap}(\text{join}_a) = \text{join}_a \circ \text{join}_{F(a)}$
- $\text{join}_a \circ \text{unit}_{F(a)} = 1_{F}$
- $\text{join}_a \circ \text{fmap}(\text{unit}_a) = 1_{F}$

同样，你可以用代码验证这几条性质的作用。你可以在 [TypeScript Playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAEg9gWwDwEEA0UBCA+KBeKACgEMAuKFASn10wChRIoAZASwGdgkAVXA7gNoBdOnQBmAVwB2AY2Cs4UqGITEwqDDkJjy8ZOizZK5QgBsOwcm06ojNFhaQ4oAbzpQoAJwjAJnpWYWVo4odni45pwAdKpg2pR0AL6iAPQpDpxQgNOkGcBQALS41sDi0nIKSgBWcKxSPNiBnME2xfVGzVy8ru5ePn5KkcBR3gAmEjIQhCQyMhgAHtThUMQzUTKKMsTAhAsYwgnJpbLyisqmW8AQUgDMACIA+gBuAIz1jZa5SK2tvNjtn103B5vL5-FBqrVCBCpO9KJQANxJUSSY4VM4XK53J4AJjegw6X0cPz+-2J3WBfTB0O0sShNSklFhCKRdHWUkycwJ30cUgkCAARhBPCT8FABD1xR4PAJnhhsRhrkI0D1pQAWDAAVhEHiVEpVYoAbLqpWKAOwYAAcGAAnNqoCIhIjWYp2HBTBAosR2OwhdsAFIAZQA8gA5KKcTy1ADmrDEIG052AlxuDxeOzh+DwBEDofDwEjUhjcYTGJTOPTcPhQA) 中验证第一条性质。

```typescript
function flatten3D_v1<T>(list: List<List<List<T>>>): List<T> {
  return join(join(list));
}

function flatten3D_v2<T>(list: List<List<List<T>>>): List<T> {
  return join(fmap(join)(list));
}

const x: List<List<List<number>>> = [
  [
    [1, 2, 3],
    [4, 5]
  ],
  [
    [6],
    [7, 8, 9]
  ]
];

const left = JSON.stringify(flatten3D_v1(x))
const right = JSON.stringify(flatten3D_v2(x))
console.assert(left === right);
```

除了保证语义之外，monad 的性质还保证了这里有基于规则重写或其他手段的自动优化 `flatten3D` 函数实现的可能性。

### 自函子范畴上的幺半群

最后，你可以开始理解「一个单子（Monad）说白了不过就是自函子范畴上的一个幺半群而已」这句话了。

首先要注意，自函子范畴并不是我们一直在说的 $U$。自函子范畴是一个更高阶的范畴，它的对象是自函子，态射是自然变换。那这就有了自函子 $\text{id}$，自函子 $F$ 作为对象和自然变换 $\text{unit}$、自然变换 $\text{join}$ 作为态射。

可见，「自函子范畴」五个字就概括了「函子 $F: U \to U$，连同两个自然变换」这些 monad 的要素了。

这里的「幺半群」是一个令人困惑的点，因为它是我们前面介绍的代数结构中的幺半群的推广。它的严格定义需要先引入张量积、自然同构等概念，构造出一个张量范畴，然后再在张量范畴上定义幺半群。本文不打算作为一个严谨的数学教材把这些概念都先定义一遍，因此直接给出结论：

- 自函子范畴是一个张量范畴；
- 自函子范畴上的函子复合就是张量积。

> 范畴 $C$ 上的张量积一般写成 $\otimes: C \times C \to C$，它是范畴 $C$ 上的一个二元运算。这里的自函子范畴就取函子复合作为张量积。因为我们这里没有给出张量积的定义，所以不严谨地，你可以先用「函子复合」这个模型来理解。

给定一个张量范畴 $C$，$C$ 上的幺半群（幺半群对象）是一个**对象** $M \in C$，连同两个态射:

- $\mu: M \otimes M \to M$
- $\eta: I \to M$

代数结构中的幺半群的性质被移植如下（下面不严谨地写了交换图的箭头）：

- 二元运算 $*$ 被 $\mu$ 取代；
- $\mu$ 满足结合律：$(M \otimes M) \otimes M \to M \otimes (M \otimes M)$
- 有一个单位元素 $I \in C$
  - 左单位律：$I \otimes M \to M$
  - 右单位律：$M \otimes I \to M$

对应到自函子范畴上：

- $F$ 自函子作为**幺半群对象** $M$；
- $\text{join}$ 自然变换作为态射 $\mu$；
- $\text{unit}$ 自然变换作为态射 $\eta$。
- $\text{id}$ 自函子作为单位元素 $I$。

回顾 monad 的 $\text{join}$ 和 $\text{unit}$ 满足的条件。第一条：

$$\text{join}_a \circ \text{fmap}(\text{join}_a) = \text{join}_a \circ \text{join}_{F(a)}$$

等号左边：

$$
\begin{align*}
\text{join}_a&: (F \otimes F)(a) \to F(a)\\
\text{fmap}(\text{join}_a)&: (F \otimes (F \otimes F))(a) \to (F \otimes F)(a)\\
\text{join}_a \circ \text{fmap}(\text{join}_a)&: (F \otimes (F \otimes F))(a) \to F(a)
\end{align*}
$$

所以它们的复合是一个 $F \otimes (F \otimes F)$ 到 $F$ 的自然变换。

等号右边：

$$
\begin{align*}
\text{join}_{F(a)}&: (F \otimes F)(F(a)) \to F(F(a))\\
\text{join}_{F(a)}&: ((F \otimes F) \otimes F)(a) \to (F \otimes F)(a)\\
\text{join}_a \circ \text{join}_{F(a)}&: ((F \otimes F) \otimes F)(a) \to F(a)
\end{align*}
$$

所以它们的复合是一个 $(F \otimes F) \otimes F$ 到 $F$ 的自然变换。

等式的意义是 $F \otimes (F \otimes F)$ 和 $(F \otimes F) \otimes F$ 到 $F$ 存在一个相等的自然变换（并且我们给出了这个自然变换）。这就是为什么 monad 的第一条规则又叫做结合律。

类似推导：

$$\text{join}_a \circ \text{unit}_{F(a)} = 1_{F}$$

说明 $\text{id} \otimes F$ 和 $F$ 到 $F$ 存在一个相等的自然变换。这就是左单位律。

$$\text{join}_a \circ \text{fmap}(\text{unit}_a) = 1_{F}$$

说明 $F \otimes \text{id}$ 和 $F$ 到 $F$ 存在一个相等的自然变换。这就是右单位律。

自然，单子是一个自函子范畴上的幺半群（对象）。
