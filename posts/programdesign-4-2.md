---
title: 程序设计 2 上机 4 - 全排列输出
date: 2021-05-05 10:23:37
tags: [算法]
mathjax: true
category: 算法
---

既然建了博客那就发挥下它的作用，以后记录下学习过程吧

~~虽然本人已经耗费了很长时间在美化上了，完全没有开始学习~~
~~不过也算是学了点 JS 和 CSS，顺便因为写博客开始研究 Markdown 和 TeX~~

那么下面来写一道搜索题（作业）

## 题目介绍

给定一没有重复数字的序列，返回其所有可能的全排列。输出需要按照输入的从前到后的顺序排列。

输入是用空格分割的几个数字，数字个数 $n$ 满足 $1 \le n \le 9$.

输出你的排列，每行一个，按照从小到大顺序。

<!-- more -->

样例输入：

> 2 3 1

样例输出：

> 231
> 213
> 321
> 312
> 123
> 132

## 思路

本题与 N 皇后问题类似，对于有 $n$ 个不重复数字的序列，只要通过递归逐个确定正在输出的全排列的 $1$ 到 $n$ 位即可。

到达第 $n+1$ 次递归时则意味着递归结束，开始输出结果。由于该序列有 $n$ 位，且不重复，故该序列的每一个数字可以与它的位置 $i,(1 \le i \le n)$ 一一对应。故递归时只需要考虑位置不要重复即可。

本题数据规模较小，可以采用位运算进行状态压缩。

## 代码

没啥好说的，比较短：

```cpp
#include <stdio.h>

void range(int* num, int depth, unsigned int now, int n, int* op) {
	if (depth == n) {	//递归出口
		for (int i = 0; i < n; i++) {
			putchar('0' + op[i]);
		}
		putchar('\n');
		return;
	}
	for (int i = 0; i < n; i++) {
		if (now & (1 << i)) {	//被占位
			continue;
		}
		op[depth] = num[i];
		range(num, depth + 1, now | (1 << i), n, op);
	}
}

int main() {
	int num[10], op[10] = { 0 }, n;
	for (n = 0; scanf("%d", num + n) != EOF; n++);
	range(num, 0, 0, n, op);
}
```
