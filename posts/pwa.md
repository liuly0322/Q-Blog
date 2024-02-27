---
title: PWA 补完计划
date: 2024-02-26 19:59:23
tags: [web, vite, pwa]
category: web
---

这篇文章记录下对博客进行的 PWA（Progressive-Web-App）改造！因为博客是基于 Vite 的，所以理论上来说安装配置一下 [VitePWA](https://github.com/vite-pwa/vite-plugin-pwa) 就 ok 了。

## PWA

PWA 这个词听上去可能很让人陌生，但在国内我们早就熟悉一个很类似的概念了——小程序。

<!-- more -->

> PWA 是 Progressive Web App 的缩写，是一种 Web App 的新模式，可以让网站具备类似原生 App 的体验。

好吧，还是很抽象，那么来看看 PWA 好处都有啥？最重要的一点，PWA 可以让网页自行管理某个作用域（例如 `/`）的所有请求，例如第一次请求后在本地储存一份缓存下来的版本，之后每次访问就不需要再联网了：

- 允许用户在离线状态下使用，甚至可以作为 app 被安装到多端桌面
- 允许预取资源，只需要预先提供一份网站的资源列表

其中预取资源对我们的博客网站来说是非常有用的，可以大大加载访问速度。当然，PWA 还有很多其他特性，比如推送通知等，但这些对于博客网站来说就不是那么重要了。

那么 PWA 有没有什么坏处呢？其实也有，相信大家都遇到过微信小程序提示更新后才能打开的情况，这是因为小程序的缓存机制导致的。PWA 也有类似的问题，如果我们的博客更新了，用户需要手动/自动刷新才能看到最新内容。本篇文章会配置自动刷新。

## VitePWA

```shell
pnpm add -D vite-plugin-pwa
```

主要在 `vite.config.ts` 中配置：

```typescript
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,json,htm}'],
    },
    includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
    manifest: {
      name: 'llyのblog',
      short_name: 'llyのblog',
      description: '我的个人博客，写点想写的',
      lang: 'zh-CN',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  })],
})
```

- `registerType: 'autoUpdate'` 配置了 PWA 自动更新；
- `workbox.globPatterns` 配置了缓存（预取）的文件类型；
- `includeAssets` 和 `manifest` 是一些元信息和图标相关的配置。

在 `main.ts` 里需要引入 `registerSW` 以实现自动更新：

```typescript
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })
```

`index.html` 中也要补充一些信息：

```html
<head>
    <title>llyのblog</title>
    <meta name="description" content="我的个人博客，写点想写的">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/favicon.ico">
    <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">
    <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
</head>
```

此时可以编译出来测测了：

```shell
pnpm build
pnpm preview
```

可以使用 [Lighthouse](https://github.com/GoogleChrome/lighthouse) 的 PWA 测试，也可以关闭 pnpm 的 preview 后测试离线访问。