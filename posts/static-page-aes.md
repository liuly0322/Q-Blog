---
title: 静态页面 AES 加密的使用
date: 2021-09-10 21:09:09
tags: [密码学]
category: web
tocbot: true
---

本文将简单介绍一种静态界面需要加密的情景，并给出使用 AES 加密算法的一种实现。

## 静态内容的加密

有些时候，我们可能需要在页面上添加一些需要密码才能查看到内容。但对于一个静态页面而言，页面源代码初始时便已经由服务器发送到了设备上，所以仅仅只通过增加一个输入密码框来“欺骗”用户并不能很好地起到保密的作用。鉴于此，我们得考虑静态页面源代码中相关内容就已经被加密，而用户通过自己的设备输入密钥，运算，来获取原有的明文。

<!-- more -->

## 已知明文攻击

如果仅仅发送密文，需要用户自己输入密钥解密，这种方式理论上已经比较安全了，但我们还希望在前端增加一个密码判定，能够判断用户是否使用了正确的密钥，只有密钥正确才会将解密的明文放到页面上，否则解密出的“明文”没有意义，应该不予反应。

在这种情况下，我们可以考虑额外增加一组对应的试探明文和密文，用户使用密钥时，先利用这个密钥解密试探密文，如果解密出了试探明文，那么再继续解密密文，得到正确的明文。

这样做虽然使得界面更加的人性化，但是却额外增加了一定的风险：攻击者可以额外得到一组明文和密文。就密码学而言，这称为 **已知明文攻击** ，因为攻击者可以根据这一组明文和密文来猜测正确的密钥，所以在加密时，我们选择的算法应当是能防范已知明文攻击的。

不过对于现代的加密算法而言，都不需要担心这个问题。

本篇文章中，我们使用 AES 加密算法来解决我们的需求。这是一种对称的加密算法，也就是加密和解密共用同一个密钥。

> 额外准备一组已知的明文和密文，是一个很自然的办法：既然我们不知道正文解密后应该是什么样子，那就先解密一段知道答案的内容，看看结果是否符合预期。不过，也有一些加密方式自带校验机制，比如 AES-GCM。它在加密时会生成一个认证标签，解密时再通过这个标签检查结果；如果输入的密码不对，校验通常就无法通过，解密操作会报错。这样，我们就可以直接根据解密是否成功来给出提示，不用再额外准备一组试探明文和密文了。

## AES 加密的使用

### 引入 AES 加密

想要在静态页面使用 AES 加密，可以直接使用谷歌开发的一个纯 JavaScript 的加密算法类库：**crypto-js** 。

引入：

```html
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/crypto-js@4.0.0/crypto-js.min.js"
></script>
```

再查阅该 JS 的 AES 相关 API：

```javascript
var CryptoJS = require("crypto-js");

// Encrypt
var ciphertext = CryptoJS.AES.encrypt(
  "my message",
  "secret key 123"
).toString();

// Decrypt
var bytes = CryptoJS.AES.decrypt(ciphertext, "secret key 123");
var originalText = bytes.toString(CryptoJS.enc.Utf8);

console.log(originalText); // 'my message'
```

还是非常简明的。

### 静态页面中的使用

首先看一下最后成品：

<!-- 为了兼容通过插入 innerHTML 的方式来加载，先写一个 pre 放需要的代码，再用 img onerror 触发执行 -->
<!-- Well, XSS is fun, isn't it? -->

<pre id="scriptSource" style="display: none">
import("/post-assets/static-page-aes/crypto-js-4.2.0.bundle.mjs").then(({ default: CryptoJS }) => {
  window.CryptoJS = CryptoJS;
  const container = document.getElementById("aesCon");
  if (!container) return;
  const form = container.querySelector("form");
  const encrypted = container.querySelector(".cryptoText");
  const input = form.querySelector("input");
  const button = form.querySelector("button");
  const status = form.querySelector('[role="status"]');

  form.onsubmit = event => {
    event.preventDefault();
    if (button.disabled) return;
    const key = input.value;
    button.disabled = true;

    try {
      const decrypt = text => CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8);
      if (decrypt(encrypted.dataset.now) !== encrypted.dataset.origin) {
        throw new Error("密码错误");
      }
      const plaintext = decrypt(encrypted.textContent.replace(/\s/g, ""));
      input.value = "";
      container.innerHTML = plaintext;
    } catch {
      status.textContent = "密码错误，请重试。";
      input.focus();
      input.select();
    } finally {
      button.disabled = false;
    }
  };
}).catch(console.error);
</pre>

<div id="aesCon" style="margin: 1.5em 0; padding: clamp(16px, 4vw, 24px); border: 1px solid var(--border, #e5e5e5); border-radius: 14px; background: var(--inset-bg, #f6f6f6);">
  <style>
    #aesCon .aes-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
    #aesCon .aes-icon { display: grid; place-items: center; flex: 0 0 38px; height: 38px; border-radius: 10px; color: var(--accent, #2563a6); background: color-mix(in srgb, var(--accent, #2563a6) 10%, transparent); }
    #aesCon .aes-copy { display: grid; gap: 3px; }
    #aesCon .aes-label { font-weight: 600; font-size: 0.95em; cursor: pointer; }
    #aesCon .aes-hint { color: var(--muted, #737373); font-size: 0.8em; }
    #aesCon .aes-controls { display: flex; gap: 10px; }
    #aesCon .aes-input { flex: 1; min-width: 0; width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--border, #e5e5e5); border-radius: 8px; color: inherit; background: var(--surface, #fff); font: inherit; line-height: 1.5; transition: border-color 150ms; }
    #aesCon .aes-input:focus { border-color: var(--accent, #2563a6); outline: 2px solid color-mix(in srgb, var(--accent, #2563a6) 30%, transparent); outline-offset: 2px; }
    #aesCon .aes-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; flex-shrink: 0; min-height: 44px; padding: 10px 18px; border-radius: 8px; border: 0; color: var(--surface, #fff); background: var(--accent, #2563a6); font: inherit; font-weight: 600; line-height: 1.5; cursor: pointer; transition: filter 150ms, opacity 150ms; }
    #aesCon .aes-button:hover:not(:disabled) { filter: brightness(0.94); }
    #aesCon .aes-button:focus-visible { outline: 2px solid var(--accent, #2563a6); outline-offset: 3px; }
    #aesCon .aes-button:disabled { opacity: 0.6; cursor: wait; }
    #aesCon .aes-status { margin-top: 12px; color: var(--muted, #737373); font-size: 0.85em; line-height: 1.6; overflow-wrap: anywhere; }
    #aesCon .aes-status:empty { display: none; }
  </style>
  <form>
    <div class="cryptoText" style="display: none" data-origin="stDkxwE" data-now="U2FsdGVkX19y5/AiAAtZy2R6PQ57zsSZgv3aghSMI4A=">
      U2FsdGVkX1+46sdLBNvOMcUJDazI3UtJA+8NZDG399Jo7s5Vgnwk5pC0yLRuJKHb5G514hI1seAQQa85/2+SduGtaVFQDHKBEmQPV5mEEAkAYfG8sxMXzqN2qU60rgC/dUu0rP43SSPWvNiUPhEi3YXYZx1rTwqKcwp6iM4M6Mw=
    </div>
    <div class="aes-header">
      <span class="aes-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path><path d="M12 14v3"></path></svg></span>
      <div class="aes-copy">
        <label class="aes-label" for="aesPassword">请输入密码查看隐藏内容</label>
        <span class="aes-hint">支持回车提交</span>
      </div>
    </div>
    <div class="aes-controls">
      <input id="aesPassword" class="aes-input" type="password" required autocomplete="current-password" placeholder="输入密码">
      <button class="aes-button" type="submit">解密</button>
    </div>
    <div class="aes-status" role="status" aria-live="polite"></div>
  </form>
</div>

<img style="display: none" alt="" src="data:image/png;base64,AA==" onerror="eval(document.getElementById('scriptSource').textContent)">

随后我们再逐部分介绍。

这个成品的正确密钥可以在文末获取。

#### 预加密处理

首先需要在提前对试探明文和明文进行加密。

可以现在任意网页中引入 `crypto-js` （本页面已经引入），根据 API 说明，进行加密。控制台中输入：

```javascript
temp = CryptoJS.AES.encrypt("明文", "密钥").toString();
```

然后输入 `temp` ，键入回车后即可查看对应的密文

举例：

```javascript
temp = CryptoJS.AES.encrypt("stDkxwE", "password").toString();
//获取本文的试探密文
```

对于明文部分，我们可以选择使用 HTML 文本，这样只要后面 JavaScript 采用 innerHTML 方法替换文本就可以保留需要的格式。

#### 界面部分

```html
<div style="border: 2px solid black;padding: 10px;">
    <div data-origin="stDkxwE" data-now="U2FsdGVkX19y5/AiAAtZy2R6PQ57zsSZgv3aghSMI4A=" style="display: none"
 class="cryptoText">
        U2FsdGVkX1+46sdLBNvOMcUJDazI3UtJA+8NZDG399Jo7s5Vgnwk5pC0yLRuJKHb5G514hI1seAQQa85/2+SduGtaVFQDHKBEmQPV5mEEAkAYfG8sxMXzqN2qU60rgC/dUu0rP43SSPWvNiUPhEi3YXYZx1rTwqKcwp6iM4M6Mw=
    </div>
    请输入密码查看隐藏内容：<input type="password">
    <button type="button" onclick="decryptContent(this)">解密</button>
</div>
```

整体加密部分采用一个黑色边框包裹起来。

初始时，密文部分 `display: none` ，仅显示输入框。密文部分还包含了一组试探的明文和密文，分别在 `data-origin` 和 `data-now` 。

提交按钮会传入 `this` 参数，指示当前按钮。

#### JS 逻辑

```javascript
function decryptContent(sub) {
  const e = sub.parentNode.firstElementChild; //密文部分
  const key = sub.previousElementSibling.value; //用户输入的密钥
  const origin = e.getAttribute("data-origin"); //试探明文
  const now = e.getAttribute("data-now"); //试探密文
  try {
    const res = CryptoJS.AES.decrypt(now, key).toString(CryptoJS.enc.Utf8);
    if (res !== origin) throw new Error("密码错误");
    //如果密钥正确
    const t = e.textContent.replace(/\s/g, "");
    sub.parentNode.innerHTML = CryptoJS.AES.decrypt(t, key).toString(
      CryptoJS.enc.Utf8
    );
  } catch {
    alert("密码错误！");
  }
}
```

比较简单，基本看注释就行（）

`e.textContent.replace(/\s/g, "")` 需要注意一下，是通过正则表达式去除了可能的空格和换行的干扰。另外，错误密钥可能在转为 UTF-8 时直接抛出异常，因此需要用 `try/catch` 统一处理。

到这里，这个简易的加密系统就已经完成了。

本文中的成品正确的密钥为： `password` 。
