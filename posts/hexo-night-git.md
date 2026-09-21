---
title: Hexo 博客夜间模式的实现兼 git 工作流简介
date: 2021-07-09 09:36:41
tags: [hexo, git]
category: web
tocbot: true
---

本篇博客将记录 Hexo 默认 landscape 主题的夜间模式实现，以及 git 工作流的简单介绍。

## 基本思路

要想实现夜间模式，就意味着应用 CSS 的改变。这里作为 JS 练习，采用纯前端的方法实现：如果当前开启了夜间模式，那么就向根结点，即 HTML 结点增加一个类 `dark-theme`，再重写深色模式使用的样式表，放置在原有样式表最后即可。

<!-- more -->

为了定位到根结点，可以采用 `document.documentElement`

为了向某一结点增加 / 删除类，可以采用 `classList.toggle('dark-theme')`，toggle 本意便是在两种状态间切换。

于是合并，就得到了第一版的 JS 代码：

```javascript
function changeDarkTheme() {
  document.documentElement.classList.toggle("dark-theme");
}
```

接下来顺利成章的开始写界面上的按钮以及夜间模式对应的样式表：

对应的 CSS 文件可以在网页的检查中找到，都写在一块，很方便看（

这样一来就完成了夜间模式的初版。

## 利用 sessionStorage 记忆

在上文那样简单完成初版后，问题很快就会出现：当进入新的页面时，网站无法记住之前的选择，这就导致想使用夜间模式时，每次进入新的网页都需要重新设置夜间模式，很麻烦。这样看来，我们需要能够全局记住用户的选择。

在 html5 中，提供了两种站点本地存储的方式，分别是 sessionStorage 和 localStorage。它们的区别在于 sessionStorage 的数据仅相当于在当前的标签页中生效，关闭标签页后数据即丢失，而 localStorage 则会全局生效，即使关闭浏览器也会继续存储。

这里采用 sessionStorage 实现（因为希望每次先考虑用户是否已经有系统设置上的偏好（深色模式））

```javascript
function changeDarkTheme() {
  document.documentElement.classList.toggle("dark-theme");
  if (document.documentElement.classList.contains("dark-theme")) {
    sessionStorage.setItem("hexoTheme", "1");
  } else {
    sessionStorage.setItem("hexoTheme", "0");
  }
}

if (sessionStorage.getItem("hexoTheme") === null) {
  //第一次访问网站，试图参考系统设定
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  if (prefersDarkScheme.matches) {
    sessionStorage.setItem("hexoTheme", "1");
    changeDarkTheme();
  } else {
    sessionStorage.setItem("hexoTheme", "0");
  }
} else {
  const theme = sessionStorage.getItem("hexoTheme");
  if (theme == 1) {
    changeDarkTheme();
  }
}
```

每次打开网页时，通过检测 sessionStorage 判断是否需要应用夜间模式。而夜间模式的切换按钮作用就是添加 / 删除 `dark-theme` 类，并更改 sessionStorage。

<p class="tip info"> 注意：这个 JS 应该放在 head 中加载，如果放在 footer 后加载会导致浅色样式生效后再应用深色模式 </p>

## git 工作流

本次增加夜间模式所进行的修改都是在修改 Hexo 主题基础之上完成的。而一个主题会包含很多文件，有时候很难记住自己所进行的修改，再加上修改一般会很多很杂，这个时候就切实需要一个好用的版本控制工具。于是这里采用了 git。

### git 安装及配置

git 的安装直接在官网下载即可。Ubuntu 则可以直接 `sudo apt-get install git` 来安装 git。

此后配置用户名和邮箱：

```bash
git config --global user.name "xxx"
git config --global user.email "xxx"
```

为了搭配 GitHub 使用，可以利用 SSH 验证。

输入：

```bash
ssh-keygen -C 'you email address@gmail.com' -t rsa
```

在 `~/.ssh` 中找到公钥文件，打开复制至自己 GitHub 设置中去即可。

可以通过 `git init` 初始化仓库，考虑和 GitHub 同步，则可以 `git clone` 来复制已有仓库。GitHub 某一个仓库中点击 clone，选择 SSH，复制后面内容，添加到 `git clone` 后即可。也可以自行指定本地仓库的路径，否则则会 clone 到当前文件夹。

此后通过 `git commit -m "这里写注释"` 可以提交当前修改（还是在本地仓库）。最后 `git push origin main` 即可推送到 GitHub。

vscode 图形界面已经集成了 git 的一些基本操作，可以很方便的完成推送。

如果想查看每次 commit 造成的更改，可以使用 `git log`，增加参数 `-p` 会显示每次 commit 造成的变化（增量形式），增加参数 `-num`（num 是自己制定的数字），则可以限制显示的提交次数。
