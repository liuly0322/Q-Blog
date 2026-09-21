---
title: GitHub Actions 持续集成体验
date: 2022-08-23 19:10:20
tags: [笔记]
category: web
---

咕了快小半年，今天更新一期关于 GitHub Actions 在项目部署测试中的应用

## 介绍

官方介绍：

> GitHub Actions 是一个持续集成和持续交付 (CI/CD) 平台，可用于自动执行构建、测试和部署管道。您可以创建工作流程来构建和测试存储库的每个拉取请求，或将合并的拉取请求部署到生产环境。
GitHub Actions 不仅仅是 DevOps，还允许您在存储库中发生其他事件时运行工作流程。例如，您可以运行工作流程，以便在有人在您的存储库中创建新问题时自动添加相应的标签。
GitHub 提供 Linux、Windows 和 macOS 虚拟机来运行工作流程，或者您可以在自己的数据中心或云基础架构中托管自己的自托管运行器。

<!-- more -->

概括一下其实就是 GitHub 给你送了台虚拟机的免费使用权，你可以利用它在项目有新 push, pull request 时或者定时执行某些构建，测试，部署的任务

- 构建：如果项目需要构建出 release 版本，可以使用它自动发布
- 测试：运行测试脚本，监测项目的可用性及正确性
- 部署：例如与 GitHub Pages 配合使用，可以自动将静态网页部署到 GitHub Pages 上

## 构建与部署

首先介绍下 GitHub Actions 的 YAML 格式，需要包含：

- 触发事件，决定什么时候运行虚拟机，可选 push/pull request/手动运行等
- 运行流程，决定具体虚拟机内执行的程序

一个项目可能需要多个 actions，每个 actions 都是 `.github/workflows` 下的一个文件，触发事件和运行流程都彼此独立

```yaml
name: build

on:
  push:
    branches:
      - posts

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: pnpm/action-setup@v2.2.2
        with:
          version: latest

      - uses: actions/checkout@v2

      - name: Set up Python 3.8
        uses: actions/setup-python@v2
        with:
          python-version: 3.8

      - name: Run build script
        run: |
          bash build.sh

      - name: Push
        uses: s0/git-publish-subdir-action@develop
        env:
          REPO: self
          BRANCH: main
          FOLDER: Q-Blog/dist
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```

例如以上是一个 workflow 文件，该 actions 的功能是在仓库内的博客 md 文件更新后，自动构建生成静态网页并 push 到 main 分支（随后这一 push 会由 GitHub Pages 负责自动更新静态网页）

- 触发事件：posts 分支的 push 请求
- 运行流程：一个 actions 可以由几个 job 组成，这些 job 可以根据需求并行或者串行，这里只有一个 job

具体来说，一个 job 由多个 step 串行组成，以下具体分析

```yaml
- uses: pnpm/action-setup@v2.2.2
  with:
    version: latest
```

通过 uses, 可以方便地使用别人编写的用于实现特定功能的 actions

with 相当于传入需要的参数

别人的 actions 可以在 GitHub 提供的 [marketplace](https://github.com/marketplace?type=actions) 找到

例如这一 step 是配置 node 和 pnpm 环境

同理

```yaml
- uses: actions/checkout@v2

- name: Set up Python 3.8
  uses: actions/setup-python@v2
  with:
    python-version: 3.8
```

分别使得 actions 可以访问本仓库文件以及设置起 python 和 pip 的环境

之后的 steps 则是构建出静态文件并 push 到 main 分支

## 测试

GitHub Actions 的另一大常见用途便是用于测试，我们经常能看见别人的开源项目会有一个 ![test passing](https://github.com/liuly0322/l-plugin/actions/workflows/test.yml/badge.svg?branch=main) 的标识，甚至还有测试覆盖率，这都可以通过 GitHub Actions 实现，例如上面的图标表示的就是某个 workflow 上次运行的测试是否通过

例如这个暑假摸了一个 QQ 机器人的插件 <https://github.com/liuly0322/l-plugin>（js 写的），就尝试配合 JS 的 mocha 测试框架玩了下 GitHub Actions 用于 push 后自动测试

只需要将测试脚本作为一个 step 执行即可：

```yaml
- name: run test script
  run: docker exec yunzai-bot sh -c "cd plugins/l-plugin/ && pnpm run test"
```

mocha 框架可以指定测试样例（可以嵌套），并最终生成报告

```js
describe('骰子', function () {
  describe('#r', function () {
    it('应该返回 114514 和 1919810 之间的一个随机数', async function () {
      const res = await command.run('r 114514 1919810')
      const num = Number(res.pop().split('：').pop())
      assert(Number.isInteger(num) && num >= 114514 && num <= 1919810)
    })
  })
  describe('#roll', function () {
    it('应该返回 a 或 b', async function () {
      const res = await command.run('roll a b')
      const choice = res.pop().pop().split('：').pop()
      assert(choice === 'a' || choice == 'b')
    })
  })
})
```

通过 assert 断言来具体测试每个样例，通过全部样例就会这样显示

```plaintext
  塔罗牌
    ✔ 应该返回一条牌面信息和对应图片 (232ms)

  每日一题
    ✔ 应该返回一张图片和对应 url (3909ms)

  求签
    ✔ 应该返回一条或两条签文消息 (72ms)

  骰子
    #r
      ✔ 应该返回 114514 和 1919810 之间的一个随机数 (51ms)
    #roll
      ✔ 应该返回 a 或 b (47ms)

  吃什么
    #今天吃什么
      ✔ 应该返回随机五个食物 (49ms)
    #咱今天吃什么
      ✔ 应该返回加入的特色菜 (105ms)

  Markdown
    ✔ 应该返回一张 Markdown 图片 (145ms)

  Tex
    ✔ 应该返回一张 Tex 图片 (967ms)


  9 passing (6s)
```

非常方便（~~而且挺好看的~~

可以在 Actions 界面选择 workflow 后再选择获取对应的图标 URL，实时显示该 workflow 的通过状态，再贴到自己的 `README.md` 里就大功告成了