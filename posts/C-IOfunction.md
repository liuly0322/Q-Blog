---
title: C 语言常用 I/O 函数
date: 2021-05-30 19:20:25
tags: [C/C++]
category: 笔记
tocbot: true
---

本文汇总了 C 语言中一些常见的输入输出函数，来源于 stdio 库。~~上学期老师讲的实在太少~~

## 基本的输入输出函数

- `printf` 与 `scanf`
- `getchar` 与 `putchar`
- `gets` 与 `puts`

从标准输入输出流（**stdin** 和 **stdout**）读入读出数据。未被重定向时默认是 **键盘** 和 **终端**。

<!-- more -->

其中 `gets` 在读取数据时未对缓冲区大小作出限制，较不安全，不推荐使用。

`printf` 和 `scanf` 作用是输出 / 读取格式化字符串。格式化字符串中存在可指定的变量，例如 %d 指示整型变量，对应的值写在格式化字符串之后。

`getchar` 和 `putchar` 仅能读入 / 输入单个字符。

`puts` 仅能输出指定字符串。

## 其他实用的 I/O 函数

### ungetc

声明：`int ungetc(int char, FILE *stream)`

作用：将指定的字符丢回指定流中（例如 stdin），可以便于后面的整体读取。

### fgets

声明：`char *fgets(char *str, int n, FILE *stream)`

作用：一次从流中读取一行，存到 str 中。

注意：当一行数目没有达到 n 时，除了末尾的'\0'标识字符串结束，在'\0'之前还会有换行符'\n'。

### snprintf

声明：`int snprintf(char *str, size_t size, const char *format, ...)`

作用：向字符串 str 中输入格式化字符串，例如：

`snprintf(str,100,"%s%s",str1,str2)` 起到了把 str1 和 str2 拼接后存入 str 的效果。

### freopen

声明：`FILE *freopen(const char *filename, const char *mode, FILE *stream)`

作用：输入输出流的重定向。例如：
`freopen("file.txt", "w+", stdout)` 将标准输出流重定向到 file.txt。

## 结束输入条件判断

见 [此文](https://blog.csdn.net/Jaster_wisdom/article/details/81161896)。

## 总结

其实这方面内容有什么问题查查文档就行，本文是挑选了一些使用的归纳一下。在考虑处理输入输出需要怎么样的函数时，主要考虑输入输出是 **字符串** 还是 **标准输入输出流** 还是 **文件流**（处理标准输入输出流时也可以利用处理文件流的函数），然后依据需求选择函数即可。
