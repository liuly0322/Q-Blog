---
title: 利用 USTC 服务器的初次建站体验
date: 2021-05-04 18:41:29
tags: [hexo]
category: web
tocbot: true
---

这是本蒟蒻建的第一个站，发的第一篇 blog，没啥特别好说的，就记录下建站过程吧～

~~话说 ubuntu 中文输入法居然直接联想出了蒟蒻，有点生草~~

---

## 准备工作

服务器和域名直接白嫖 [妮可提供的](https://home.ustc.edu.cn)，因此接下来只需要选一个网页框架就行了。这里选用 [hexo](https://hexo.io)，又轻量又简单，官方文档有中文版本，看起来很舒服。

---

## 下载安装 hexo

本人目前使用 ubuntu，故下文的操作方法均为 ubuntu 下。实际上这里跟着官方文档走就行了，没啥大问题。在安装 hexo 之前，需要先安装 node.js 和 git。

<!-- more -->

git:
`$ sudo apt-get install git-core`

node.js:
`$ curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - sudo apt-get install -y nodejs`

之后即可安装 hexo:
`$ npm install -g hexo-cli`

---

## 本地建站及编辑

确认自己需要建站的目录 (folder)，之后执行

```shell
$ hexo init <folder>
$ cd <folder>
$ npm install
```

此时一个网页就已经在本地建好了。

使用 `$ hexo server` 或 `$ hexo s` 后即可通过 localhost:4000 进行本地的网页预览。

对于网页编辑，可以参考官方文档进行主题下载，下载之后可以参考主题之内的说明进行修改。

本站目前使用官方自带 landscape 主题，进行了如下修改：

1. 文字部分实现汉化
2. 更换 banner 至~~二次元萌妹~~
3. 标题由居中改为居左，去除阴影，同时添加左边间隔，优化视觉体验
4. 删除 RSS 订阅
5. 根据主题文档说明，增加了 Valine 提供的留言功能，欢迎来~~对线~~探讨交流

在本地预览完成后，通过 `$ hexo generate` 或 `$ hexo g` 即可将网页生成为静态形式（hexo 是一个纯前段的框架）

---

## 部署到服务器

依据 [USTC 网络服务中心的这则说明](https://ustcnet.ustc.edu.cn/2015/0324/c11130a120792/page.htm)，个人主页仅能通过 ftp 连接，因此可以通过手动复制生成后的静态网页至 `/public_html` 下。值得注意的是，由于科大主页的路径限制，前面在生成静态网页时的部分配置（\_config.yml）也需要修改如下：

```
url: http://home.ustc.edu.cn/~username
root: /~username/
```

其中 username 是网络信息服务中心的用户名。

此外，hexo 也提供了自动部署指令：`$ hexo deploy` 或 `$ hexo d`，需要提前在\_config.yml 下配置，参考 [hexo 部署](https://hexo.io/zh-cn/docs/one-command-deployment)。

不过本人按照说明配置完后，部署完会出现 ECONNRESET，不知道是啥 bug，初步怀疑与中文目录有关（？

解决方式：（供参考）利用 vscode 的 ftp-sync 扩展实现自动同步。

部署完成后即可打开 [https://home.ustc.edu.cn/~username](https://home.ustc.edu.cn/~username)，进入自己的主页～
