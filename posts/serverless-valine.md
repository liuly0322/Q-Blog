---
title: Valine 评论系统及 Serverless 浅探
date: 2021-09-16 00:08:47
tags: [serverless]
category: web
tocbot: true
---

事情起因是这样的：

![起因](./serverless-valine/1269gtz.jpg)

于是遂决定给自己的博客实现 **最近评论** 功能。

本文将简要介绍本博客采用的 [Valine](https://valine.js.org/) 评论系统背后的原理，并最后给出最近评论功能的实现，全站访问计数功能的实现。

<!-- more -->

## Serverless 平台

所谓 Serverless 平台，字面意思似乎是无服务器平台。但这显然不是指这个平台可以让你的网站不需要使用服务器，而是指你在应用上不需要直接和服务器打交道：Serverless 平台，比如 Valine 所依托的 LeanCloud，往往会提供一些服务/接口，来实现这一目的，比如：

- BaaS：Backend as a Service，后端即服务的缩写。指用户可以直接调用一些成熟后端模块的 API，比如账户系统，数据库等。
- FaaS：Function as a Service，函数即服务的缩写。相当于提供了一种代码运行的托管环境，可以减轻前端运算量。比如，如果需要计算一个类中各个元素的平均数（例如查询一个电影的平均评分），交由后端计算好平均数后再返回显然比前端获取所有评分数据后再在前端计算合理。

实际上，Serverless 相当于服务器和用户之间又添加了一个抽象层，方便用户使用。显然，对于小项目而言，这种做法是非常方便的。增加这一抽象层可以使轻量级项目更注重于前端界面，而不需要费力实现后端的数据处理。

如果说云服务器使得普通人不需要担心服务器的运维工作，Serverless 平台则使普通人不需要担心服务器。不过，简化也有简化的代价，过度简化会使得复杂逻辑不好实现，且对于 FaaS 服务而言，函数之间也很难共享信息等。此外，整个项目的 debug 也可能会更加麻烦。

## Valine

Valine 评论系统便是基于 LeanCloud 这一 Serverless 平台的。

简单来说，LeanCloud 提供了 [数据存储功能](https://leancloud.cn/docs/leanstorage_guide-js.html) ，相当于提供了一个简易的数据库。

通过初始化 LeanCloud 应用：

```javascript
AV.init({
  appId: "xxxxxxxxxx",
  appKey: "yyyyyyyyy",
  //serverURL: "https://please-replace-with-your-customized.domain.com"
});
```

便可以使用该应用对应的小“数据库” 。

Valine 系统便是依此完成了评论的上传，下载，显示。

### 安全性

其实大部分时候无需担心安全性问题，对于 XSS 攻击，Valine 的策略是在显示评论前先把一些可疑的标签，比如 `<script>` 过滤掉，再渲染评论。

但是 Valine 确实无法很好地保护数据隐私安全，像是 IP 地址等信息，可以在 LeanCloud 平台设置使得无法被获取到，但对于邮箱信息，是直接明文传输，所以有泄露的风险（比如可以直接在浏览器控制台爬取）。在意这一点的话还是匿名吧（）

## 应用

### 最近评论

进入正题（？

页面部分：

```html
<div class="widget-wrap">
  <h3 class="widget-title">最新评论</h3>
  <div
    class="widget"
    id="recent-comment"
    style="padding: 0 20px 15px 15px;"
  ></div>
</div>
```

js 部分需要用到 md5（为了使用 Gravatar 头像） ，直接调库： `https://cdn.jsdelivr.net/npm/md5@2.3.0/dist/md5.min.js`

其余直接调接口就行了

```javascript
const timeAgo = (date) => {
  let t = new Date().getTime() - date.getTime();
  const f = (n) => Math.floor(n);
  if (t > 691200000) {
    const pad = (n) => (n.toString().length < 2 ? "0" + n : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}`;
  }
  if (t >= 86400000) return `${f(t / 86400000)}天前`;
  if (t >= 3600000) return `${f(t / 3600000)}小时前`;
  if (t >= 60000) return `${f(t / 60000)}分钟前`;
  if (t >= 0) return `${f(t / 1000)}秒前`;
  return "刚刚";
};
const getRecentComment = setInterval(() => {
  if (typeof AV != "undefined" && AV.applicationId) {
    //开始获取评论
    clearInterval(getRecentComment);
    const query = new AV.Query("Comment"); //新建一个查询对象，查询评论
    query.descending("createdAt"); //时间排序，获取最新评论
    const regExp = new RegExp("^((?!microblog).)*$");
    query.matches("url", regExp); //过滤掉微博内容
    let n = Number.parseInt("3"); //设定的初始获取条数
    query.limit(n);
    let s = new Array(),
      count = 0; //每条评论对应一个 vcard，存放在 s 内
    query.find().then((comments) => {
      n = comments.length;
      comments.forEach((comment, i) => {
        const url = comment.get("url"); //评论对应的网页
        const image = `https://gravatar.loli.net/avatar/${MD5(
          comment.get("mail")
        )}?d=robohash`; //头像
        fetch(url)
          .then((res) => res.text())
          .then((text) => {
            const index = text.indexOf("og:title");
            let t = text.slice(index + 19);
            t = t.slice(0, t.indexOf('"')); //查找评论对应网页标题
            s[i] = `<div class="vcard">
                      <img class="vimg" src="${image}">
                      <div class="vh">
                        <span>${comment.get(
                          "nick"
                        )}</span> ： <a href="${url}" class="comment-from">「${t}」</a>
                        <div class="vtime">${timeAgo(
                          comment.get("insertedAt")
                        )}</div>
                        <div class="comment-text">${comment.get(
                          "comment"
                        )}</div>
                      </div>
                    </div>`;
            count++;
          });
      });
    });
    const waitToJoin = setInterval(() => {
      if (count == n) {
        //已经获取到全部评论
        clearInterval(waitToJoin);
        document.querySelector("#recent-comment").innerHTML = s.join("");
      }
    }, 100);
  }
}, 100);
```

由于页面内的 `Valine.js` 已经做了 LeanCloud 平台的登录到应用的工作，所以这里只要轮询直到加载好即可。

加载好的标志是： `typeof (AV) != 'undefined' && AV.applicationId`

后面挑几处有意思的细节讲讲：

#### 时间处理

也就是脚本的第一个函数：

```javascript
const timeAgo = (date) => {
  let t = new Date().getTime() - date.getTime();
  const f = (n) => Math.floor(n);
  if (t > 691200000) {
    const pad = (n) => (n.toString().length < 2 ? "0" + n : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}`;
  }
  if (t >= 86400000) return `${f(t / 86400000)}天前`;
  if (t >= 3600000) return `${f(t / 3600000)}小时前`;
  if (t >= 60000) return `${f(t / 60000)}分钟前`;
  if (t >= 0) return `${f(t / 1000)}秒前`;
  return "刚刚";
};
```

其实原来这是个 [60+ 行的库](https://github.com/xCss/Valine/blob/87da8204db50194c338f6929166f80f41ca87222/src/utils/timeago.js)，不过出于简洁考虑重写了一下。可以明显感觉到 JavaScript 中 lambda 表达式实在是太方便了（）

这里逻辑上是用 `return` 代替了原来一大堆 `if ... else ...`

#### 异步处理

这里 `const url = comment.get('url');` 在得到评论对应页面的 url 后，还需要加载这些页面内容，然后提取标题（后面一大段逻辑都是在处理这个）。

这里是采用轮询的方式，利用 `n` 记录评论总数（初始是设定的默认值，但是如果实际从后端获取到满足条件的评论数少于这一默认值的话，会更新 `n` ）。如果目前已经获取的标题数量恰好等于 `n` ，那么就可以进行最后的输出了。 ~~尝试使用 Promise 重构结果失败了~~

在此之前，我们采用数组记录每次的结果：这实际是很方便的，因为我们既想要异步的效率，又想要评论按照顺序排列，那么直接按照索引存储在数组里，最后再合并就好。

> 2021.9.18 更新：

现在成功采用 `Promise.all()` 重构了一遍。 `Promise.all()` 需要参数是 `Promise` 数组，所以先对每一个 comment，取标题所对应的 url，再通过 `fetch` 获取对象后使用 `text` 方法，返回带有网页文本的 `Promise` 对象。这些对象组合而成的 `Promise` 数组就是 `Promise.all()` 的对象。随后， `Promise.all()` 方法会等待所有的请求完成，再在此时处理文本，即可拿到所有的标题。之后即可得出评论对应的 html。

对应代码如下：

```javascript
query.find().then((comments) => {
  Promise.all(
    comments.map((comment) =>
      fetch(comment.get("url")).then((resp) => resp.text())
    )
  ).then((texts) => {
    let res = ""; //最终内部 html
    texts.forEach((text, i) => {
      let title = text.slice(text.indexOf("og:title") + 19);
      title = title.slice(0, title.indexOf('"')); //获取标题
      const get = (str) => comments[i].get(str); //简化取评论对象某个值的操作
      res += `<div class="vcard">
                <img class="vimg" src="https://gravatar.loli.net/avatar/${MD5(
                  get("mail")
                )}?d=robohash">
                <div class="vh">
                    <span>${get("nick")}</span> ： <a href="${get(
        "url"
      )}" class="comment-from">「${title}」</a>
                    <div class="vtime">${timeAgo(get("insertedAt"))}</div>
                    <div class="comment-text">${get("comment")}</div>
                </div>
            </div>`; //这是第 i 条评论的 html，追加到 res 上
    });
    document.querySelector("#recent-comment").innerHTML = res; //渲染
  });
});
```

由于我们只是异步拿到了所有的标题对应的网页的文本，所以后面的处理操作都是同步进行的，因此不再需要 `s` 数组记录每次的结果，而是直接顺序追加到字符串 `res` 上。

通过使用 `Promise.all()` ，也就不再需要记录已经完成的数量 `count` 来判断是否已经全部完成了。

### 全站访问量统计

这个主要是使用了 FaaS：我们直接在 LeanCloud 上搭建一个 Hook 函数，每次 Counter 类（这是 Valine 默认存储页面访问计数的位置）有元素更新（代表有文章页面被访问）后，我们给 Counter 类里的一个变量（当然，这个变量需要自己创建）自增（这里要防止死循环问题），这样这个变量就可以代表全站访问量了。初始化这个变量时可以填入原先访问量计数。

后端 Hook 函数内容：

```javascript
const query = new AV.Query("Counter");
query.equalTo("title", "sum"); //找到负责计数的元素
query.first().then((count) => {
  count.disableAfterHook(); //防止死循环
  count.increment("time");
  count.save(); //更新计数元素
});
```

前端获取该变量：

```html
<p>本站总访问量： <span id="total-visits"></span> 次</p>
<script>
  const id = setInterval(() => {
    if (typeof AV != "undefined" && AV.applicationId) {
      clearInterval(id);
      const query = new AV.Query("Counter");
      query.equalTo("title", "sum"); //找到全站计数的元素（标记是自己设置的）
      query.first().then((count) => {
        document.querySelector("#total-visits").innerHTML = count.get("time");
      });
    }
  }, 100);
</script>
```
