---
title: PWA 补完计划
date: 2024-02-26 19:59:23
tags: [vite, pwa]
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

其中预取资源对我们的博客网站来说是非常有用的，可以大大加载访问速度。当然，PWA 还有很多其他特性，比如推送通知等，但这些对于一个静态博客网站来说就不是那么重要了。

那么 PWA 有没有什么坏处呢？其实也有，相信大家都遇到过微信小程序提示更新后才能打开的情况，这是因为小程序的缓存机制导致的。PWA 也有类似的问题，如果我们的博客（程序）更新了，用户需要手动/自动刷新才能看到最新内容。本篇文章会具体解释这一更新机制。

## VitePWA

```shell
pnpm add -D vite-plugin-pwa
```

配置过程参考了 VitePWA 的 [PWA Minimal Requirements](https://vite-pwa-org.netlify.app/guide/pwa-minimal-requirements.html)、[Automatic reload](https://vite-pwa-org.netlify.app/guide/auto-update.html) 和 [Static assets handling](https://vite-pwa-org.netlify.app/guide/static-assets.html)。此外，[Periodic Service Worker Updates](https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html) 解释了如何以指定间隔检查更新，[Unregister Service Worker](https://vite-pwa-org.netlify.app/guide/unregister-service-worker.html) 解释了如何在启用后禁用 PWA 功能，也值得看看。

`index.html` 中需要补充一些元信息：

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

`vite.config.ts` 中配置：

```typescript
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [VitePWA({
    // 配置自动更新
    registerType: 'autoUpdate',
    workbox: {
      // 配置缓存列表
      globPatterns: ['**/*.{js,css,ico,svg}', 'index.html'],
      // https://github.com/vite-pwa/vite-plugin-pwa/issues/120
      navigateFallback: null,
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
- `workbox.globPatterns` 配置了所有需要缓存（预取）的文件；
- `includeAssets` 和 `manifest` 是一些元信息和图标相关的配置。

图标可以在 [Favicon InBrowser.App](https://favicon.inbrowser.app/tools/favicon-generator) 生成。

在 `main.ts` 里需要引入 `registerSW` 以实现自动更新：

```typescript
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })
```

此时可以编译出来测测了：

```shell
pnpm build
pnpm preview
```

可以使用 [Lighthouse](https://github.com/GoogleChrome/lighthouse) 的 PWA 测试，也可以关闭 pnpm 的 preview 后测试离线访问。DevTools 的 Network 和 Application 面板对调试也会很有帮助。

## PWA 的更新

上文提到：

> 如果我们的博客（程序）更新了，用户需要手动/自动刷新才能看到最新内容。

现在可以整理一下更新逻辑了。首先，博客（程序）是指 `sw.js` 和在 `sw.js` 缓存列表（就是 `vite.config.ts` 中配置的 `workbox.globPatterns`）中的文件（而不是所有的静态文件！注意未被缓存的静态文件的更新不必引起 PWA 的更新）。缓存列表中的文件的更新会引起 `sw.js` 的更新，因为 `sw.js` 中保存了所有缓存列表的文件的 hash 值。

对于客户端而言，是每次打开网页后，`registerSW({ immediate: true })` 检测到 `sw.js` 更新后，会强制刷新页面。这样就实现了自动更新。

但是，对于我们的博客网页来说，这样的更新存在下列问题：

- 打开网页可能看到的是旧版内容，比如新更新的博客没刷新出来；
- 由于强制刷新，用户可能会看到白屏一闪而过。

一个策略是降低更新频率。可以把博客想象成一个论坛 app，UI 和动态的帖子数据（这里就是我们的每一篇博客内容）是分离的。只有当 UI 更新时才需要强制刷新，而帖子数据可以做成动态的数据请求，比如请求一个 JSON 文件。帖子的更新通过 JSON 文件的更新来实现，只有 UI 的更新会更改 `sw.js`。

上面的更新策略对于一个前后端分离的实现是很自然的，但对于我们的静态博客（或者一些 SSR/SSG 的网站）来说，这样的更新策略就需要更小心一点了。回忆一下，`sw.js` 中保存了所有缓存列表的文件的 hash 值，这意味着只要缓存列表中的文件有更新，`sw.js` 就会更新，从而强制刷新页面。

比如，如果我们的博客内容是通过请求某个 JSON 文件得到的，那么这个 JSON 文件就不能被缓存，否则每次博客更新都会导致 `sw.js` 更新，从而需要强制刷新页面。同理，对于一些 SSR/SSG 场景，可能并不希望 HTML 文件被缓存，这个时候只配置缓存 JS 和 CSS 文件就好了。可以参考这个 [issue](https://github.com/vite-pwa/vite-plugin-pwa/issues/120) 的讨论。