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
- 怎么理解“一个单子（Monad）说白了不过就是自函子范畴上的一个幺半群而已”? - chris的回答 - 知乎：<https://www.zhihu.com/question/282666729/answer/508110678>
- 十分钟魔法练习 - 玩火：<https://magic.huohuo.moe/>

## 幺半群（Monoid）

幺半群是一个代数结构。不过我们这里不直接介绍代数结构的概念，而是用代码来说明。

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

在这里，`Product` 是一个「二元运算」，`getIdentityElement` 是返回一个「单位元素」。幺半群要求这个二元运算满足结合律，即 `(a * b) * c = a * (b * c)`，并且单位元素满足 `a * 1 = 1 * a = a`。

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
function reduce<T>(arr: T[], Product: (x: T, y: T) => T, identityElement: T): T {
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

范畴对讨论的对象的层次进行了限制，（当前）我们讨论的对象，即「类型」，都处于同一层次，都是某个具体的、可以被构造出来的类型，如 `int, List<int>, List<List<int>>`。之所以要强调这一点，是因为「类型」也可以看成有「类型」，类型的类型一般称为 kind。例如 `List` 接受一个「具体类型」，输出一个「具体类型」，所以 `List` 的 kind 是 `Type -> Type`。限制在「具体类型」这一层后，我们就不必讨论 `List` 这种一阶，甚至高阶类型（`(Type -> Type) -> Type`）。

范畴间的映射就是函子。因为我们的语境下只有一个范畴，就是全体「具体类型」为对象的范畴，所以这里的函子都是自函子（自函子就是范畴到自身的映射）。

还是有点抽象，范畴间的映射是什么呢？严格的定义可以参考范畴的交换图，直观理解就是：我们有函数 $F$，使得对于每个对象 $A$，$F$ 将 $A$ 对应到 $F(A)$，并且对于每个 $f: A \to B$，我们有 $F(f): F(A) \to F(B)$，即 $F$ 保持了范畴间的结构。写成代码：

```typescript
type Hom<A, B> = (a: A) => B
type List<T> = T[]

function fmap<A, B>(f: Hom<A, B>): (list: List<A>) => List<B> {
  return (list: List<A>) => list.map(f)
}
```

回顾两条性质：

- 对于每个对象 $A$，$F$ 将 $A$ 对应到 $F(A)$。这里每个 `T` 对应到 `List<T>`。
- 对于每个 $f: A \to B$，我们有 $F(f): F(A) \to F(B)$。这里每个 `f: A => B` 对应到 `fmap(f): List<A> => List<B>`。

所以 `List` 是一个一阶类型，同时也是一个（「具体类型」范畴上的）函子。这就体现出了范畴对层次抽象的好处。

这里我们没有讨论更复杂的类型，如 `Map`，它接受两个类型参数，不过这可以用柯里化的技巧绕过，这里不再展开。

## 单子（Monad）

现在我们知道幺半群和函子的定义，那么单子是什么呢？单子是一个自函子范畴上的幺半群，即一个函子，同时具备幺半群的性质。

> Haskell 和其他很多编程语言的 monad 具有的基本操作是 bind 和 return，读者可能会发觉 bind 和 return 和本文在构造的东西好像没什么关系，实际上两种定义确实不同。虽然它们是等价的，但为避免混淆，请先忘掉 Haskell 的 bind 和 return 那套。

在范畴上构建幺半群其实不是很显然。再次注意，范畴讨论的是对象和对象之间的映射。因此，为了引入单位元，我们需要范畴具备一个「终对象」；为了引入乘法，我们需要范畴具备一个「直积」。不过我们可以不用考虑这些通用的「抽象废话」，而是对「自函子」和「幺半群」进行提炼：

- 自函子：`List, Set, Maybe, Either` 等；
- 幺半群：运算的结合性、单位元。

运算的结合性我们之前写的是：

```typescript
function Product<T>(x: T, y: T) {
  return x * y
}
```

函数签名：`(x: T, y: T) => T`。

那么要求自函子结合，就是要求某种 `Functor F`，有一个新的函子由原先函子组合（Product）：`(F, F) => F`。在「自函子范畴」上，Product 操作就是自函子的组合。

这里注意，虽然我们之前说 `List, Set, Maybe, Either` 都是自函子，但我们考虑自函子的组合是取 `(F, F) => F` 中的 `F` 为某个特定的自函子，例如 `List`，而不是任意两个自函子组合。这样 `(F, F) => F` 就是自函子范畴上 $F \times F$ 到 $F$ 的态射。

单位元的定义有些出入。单位元不再是 `F` 的一个元素，而是 1（范畴的终对象，自函子范畴上就是 identity 函子）到 `F` 的一个态射。这样再要求一下结合性和单位元乘积的性质（用交换图），我们就在自函子范畴上建立了一个幺半群。

结合函子本身有的 `fmap` 方法，我们终于可以定义 monad 了：

```typescript
type Hom<A, B> = (a: A) => B
type List<T> = T[]

// 1 到 F 的态射
function unit<T>(x: T): List<T> {
  return [x]
}
// FxF 到 F 的态射
function join<T>(list: List<List<T>>): List<T> {
  return list.reduce((acc, x) => acc.concat(x), [])
}
// map
function fmap<A, B>(f: Hom<A, B>): (list: List<A>) => List<B> {
  return (list: List<A>) => list.map(f)
}
```

上面我们略过了交换图的具体要求。但显然这里的 `unit` 和 `join` 操作不是任意的，它们要满足范畴上的幺半群的性质。参考维基百科 - [Monad](https://en.wikipedia.org/wiki/Monad_(functional_programming))：

```
(unit ∘ φ) x ↔ ((map φ) ∘ unit) x ↔ x
(join ∘ (map join)) mmma ↔ (join ∘ join) mmma ↔ ma
(join ∘ (map unit)) ma ↔ (join ∘ unit) ma ↔ ma
(join ∘ (map map φ)) mma ↔ ((map φ) ∘ join) mma ↔ mb
```

这其实和 Haskell 的 `return`、`bind` 表述是等价的。Haskell 的 `return` 就是 `unit`，所以我们用 `unit`, `join`, `fmap` 来实现 `bind`：

```typescript
function bind<A, B>(f: Hom<A, List<B>>): (list: List<A>) => List<B> {
  return (list: List<A>) => join(fmap(f)(list))
}
```

可以看出 `bind` 其实就是更甜的 `fmap`，它将 `List<A>` 映射到 `List<List<B>>`，然后再 `join`。
