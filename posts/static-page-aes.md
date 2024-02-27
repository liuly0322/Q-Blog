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

## AES 加密的使用

### 引入 AES 加密

想要在静态页面使用 AES 加密，可以直接使用谷歌开发的一个纯 JavaScript 的加密算法类库： **crypto-js** 。

引入：

```html
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/crypto-js@4.0.0/crypto-js.min.js"
></script>
```

再查阅该 js 的 AES 相关 API：

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

(见 [原博客](http://home.ustc.edu.cn/~liuly0322/blog/2021/09/10/static-page-aes/#more)，现在搬迁到 Vue3 + TS 了重写有点麻烦)

随后我们再逐部分介绍。

这个成品的正确密钥可以在文末获取（括弧笑

~~由于懒得写 css 所以很丑~~

#### 预加密处理

首先需要在提前对试探明文和明文进行加密。

可以现在任意网页中引入 `crypto-js` （比如本页面），然后根据 API 说明，进行加密。控制台中输入：

```javascript
temp = CryptoJS.AES.encrypt("明文", "密钥").toString();
```

然后输入 `temp` ，键入回车后即可查看对应的密文

举例：

```javascript
temp = CryptoJS.AES.encrypt("stDkxwE", "password").toString();
//获取本文的试探密文
```

对于明文部分，我们可以选择使用 html 文本，这样只要后面 JavaScript 采用 innerHTML 方法替换文本就可以保留需要的格式。

#### 界面部分

```html
<div style="border: 2px solid black;padding: 10px;">
    <div data-origin="stDkxwE" data-now="U2FsdGVkX19y5/AiAAtZy2R6PQ57zsSZgv3aghSMI4A=" style="display: none"
 class="cryptoText">
        U2FsdGVkX1+tZBv8Pm1WWqR23FPMqHVtrqgXVMcOnLGHw4vbaZlfj01cw8UIzH4Oo2U38Q7a2ka+alOGezBznPeyIfTGOaKFdilDO6vbTs1g+3GUgP3aX81Hnb2js5Y3wv75yRVIWQgk9mrOoICBsD2GAWpPHzTYADMyautvG90=
    </div>
    请输入密码查看隐藏内容：<input type="password">
    <input type="submit" onclick="crypto(this)"></button>
</div>
```

整体加密部分采用一个黑色边框包裹起来。

初始时，密文部分 `display: none` ，仅显示输入框。密文部分还包含了一组试探的明文和密文，分别在 `data-origin` 和 `data-now` 。

提交按钮会传入 `this` 参数，指示当前按钮。

#### js 逻辑

```javascript
function crypto(sub) {
  const e = sub.parentNode.firstElementChild; //密文部分
  const key = sub.previousElementSibling.value; //用户输入的密钥
  const origin = e.getAttribute("data-origin"); //试探明文
  const now = e.getAttribute("data-now"); //试探密文
  const res = CryptoJS.AES.decrypt(now, key).toString(CryptoJS.enc.Utf8);
  if (res == origin) {
    //如果密钥正确
    const t = e.innerHTML.replace(/\s/g, "");
    sub.parentNode.innerHTML = CryptoJS.AES.decrypt(t, key).toString(
      CryptoJS.enc.Utf8
    );
  } else {
    alert("密码错误！");
  }
}
```

比较简单，基本看注释就行（）

`e.innerHTML.replace(/\s/g, "")` 需要注意一下，是通过正则表达式去除了可能的空格和换行的干扰。

到这里，这个简易的加密系统就已经完成了。

本文中的成品正确的密钥为： `password` 。
