---
title: 一个利用积分区域对称性得到的结论
date: 2021-05-07 07:54:09
tags: [数学]
mathjax: true
category: 笔记
---

题目来源于数学分析 B2 的一道作业证明题：

$$
\int_{0}^{a}dx_{1}\int_{0}^{x_{1}}dx_{2}...\int_{0}^{x_{n-1}}f(x_{1})f(x_{2})...f(x_{n}) dx_{n}=\frac{1}{n!}(\int_{0}^{a} f(t) dt )^{n}
$$

这是一个关于多重积分的题目，我们可以通过积分区域的对称性来巧妙解决。

<!-- more -->

首先，本题积分区域为：

$$0  \le x_{n} \le x_{n-1} \le ... \le x_{2} \le x_{1} \le a$$

注意到这事实上相当于 $[0,a]$ 上的无序数组 $(x_{1},x_{2},x_{3},...,x_{n})$ 选定顺序，总顺序组数即为 $n$ 的全排列数 $n!$ 组。

而任意给定一组顺序，都相当于划分出了 $n$ 维空间中的一个区域，显然，这些区域具备以下性质：

1. 除了边界之外，这些区域彼此无交
2. 这些区域的并是 $[0,a]^{n}$
3. 由于对称性， $F=f(x_{1})f(x_{2})...f(x_{n})$ 在每个区域上的积分值相等

故：

$$LHS=\frac{1}{n!}\int_{0}^{a}\mathrm{d}x_{1}\int_{0}^{a}\mathrm{d}x_{2}...\int_{0}^{a}f(x_{1})f(x_{2})...f(x_{n}) \mathrm{d}x_{n}=RHS$$

证毕。

---

对于并不具有完全对称性的某些题目，也可以引入这个结论解决。

例如数学分析 B2 的另一道证明题：

$$\int_{0}^{a}\mathrm{d}x_{1}\int_{0}^{x_{1}}\mathrm{d}x_{2}...\int_{0}^{x_{n-1}}f(x_{n}) \mathrm{d}x_{n}=\frac{1}{(n-1)!}\int_{0}^{a}f(t)(a-t)^{n-1} \mathrm{d}t$$

本题并不是关于 $n$ 个变量均对称，所以考虑更改积分区域，先对 $x_{i}$ $, 1 \le i \le n-1$ 进行积分。

故：

$$
\begin{align*}
LHS&=\int_{0}^{a}\mathrm{d}x_{n}\int_{x_{n}}^{a}\mathrm{d}x_{n-1}...\int_{x_{2}}^{a}f(x_{n}) \mathrm{d}x_{1}\\\\&=\frac{1}{(n-1)!}\int_{0}^{a}f(x_{n})(a-x_{n})^{n-1} \mathrm{d}x_{n}=RHS
\end{align*}
$$

证毕。
