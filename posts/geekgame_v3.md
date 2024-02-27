---
title: GeekGame 2023 个人题解
date: 2023-10-20 13:18:59
tags: [ctf, web, 密码学, python, js]
category: 笔记
mathjax: true
tocbot: true
---

发现自己很久没更过博客了，也确实有点不知道该写什么，于是来水一篇最近的第三届北京大学信息安全综合能力竞赛（PKU GeekGame）部分题解了。~~工作摸鱼~~打了一周，最后总排名 15。

<!-- more -->

碎碎念：感觉 GeekGame 的 Web 题质量好高，做爽了。

本题解不含图片，可放心食用。

## 一眼盯帧

签到题。提取 GIF 的每一帧有很多方法，比如直接谷歌，找一个在线工具网站就好了。然后 rot13。

## 小北问答!!!!!

~~It's MyGO!!!!!~~

> 在北京大学（校级）高性能计算平台中，什么命令可以提交一个非交互式任务？

谷歌关键词：北京大学（校级）高性能计算平台、非交互式任务，得 sbatch。

> 根据 GPL 许可证的要求，基于 Linux 二次开发的操作系统内核必须开源。例如小米公司开源了 Redmi K60 Ultra 手机的内核。其内核版本号是？

谷歌得小米内核开源项目的 GitHub 地址，README 中指出了 Redmi K60 Ultra 对应的分支 corot-t-oss，所以可以找到 [构建的 Makefile 文件](https://github.com/MiCode/Xiaomi_Kernel_OpenSource/blob/corot-t-oss/Makefile)。

```makefile
# SPDX-License-Identifier: GPL-2.0
VERSION = 5
PATCHLEVEL = 15
SUBLEVEL = 78
```

所以答案是 5.15.78。

> 每款苹果产品都有一个内部的识别名称（Identifier），例如初代 iPhone 是 iPhone1,1。那么 Apple Watch Series 8（蜂窝版本，41mm 尺寸）是什么？

搜索：Identifier、iPhone1,1 就能找到完整对照表。

> 本届 PKU GeekGame 的比赛平台会禁止选手昵称中包含某些特殊字符。截止到 2023 年 10 月 1 日，共禁止了多少个字符？（提示：本题答案与 Python 版本有关，以平台实际运行情况为准）

找到源码，加一条 print 语句，python 跑一下就可以了。

> 在 2011 年 1 月，Bilibili 游戏区下共有哪些子分区？（按网站显示顺序，以半角逗号分隔）

众所周知 Bilibili 现用域名 <https://www.bilibili.com/>，但是直接在 WebArchive 上是找不到对应历史的，搜索后得知 2011 年 1 月 Bilibili 域名 <https://bilibili.us/>，用这个在 WebArchive 上查就可以了。

> 这个照片中出现了一个大型建筑物，它的官方网站的域名是什么？（照片中部分信息已被有意遮挡，请注意检查答案格式）

简单来说图片里有一些赞助商信息，搜索得知这是 2023 年的 IASP 会议，举办地点在卢森堡的 European Convention Centre Luxembourg，但是建筑图片和照片对不上，所以谷歌地图查看周围建筑，发现符合条件的建筑是卢森堡音乐厅，所以答案是 philharmonie.lu。

## Z 公司的服务器

### 第一问

直接打开终端显示 `�*B00000000000000`，搜索发现应该是 Z Modem 协议，用支持的客户端 ZOC Terminal 连接即可接收文件。

## 猫咪状态监视器

阅读 `/usr/sbin/service` 源码，发现没有 systemd 的环境下逻辑是这样的：

```shell
SERVICEDIR="/etc/init.d"

......

run_via_sysvinit() {
   # Otherwise, use the traditional sysvinit
   if [ -x "${SERVICEDIR}/${SERVICE}" ]; then
      exec env -i LANG="$LANG" LANGUAGE="$LANGUAGE" LC_CTYPE="$LC_CTYPE" LC_NUMERIC="$LC_NUMERIC" LC_TIME="$LC_TIME" LC_COLLATE="$LC_COLLATE" LC_MONETARY="$LC_MONETARY" LC_MESSAGES="$LC_MESSAGES" LC_PAPER="$LC_PAPER" LC_NAME="$LC_NAME" LC_ADDRESS="$LC_ADDRESS" LC_TELEPHONE="$LC_TELEPHONE" LC_MEASUREMENT="$LC_MEASUREMENT" LC_IDENTIFICATION="$LC_IDENTIFICATION" LC_ALL="$LC_ALL" PATH="$PATH" TERM="$TERM" "$SERVICEDIR/$SERVICE" ${ACTION} ${OPTIONS}
   else
      echo "${SERVICE}: unrecognized service" >&2
      exit 1
   fi
}
```

所以 payload 是 `../../../../usr/bin/cat flag.txt`。

## 基本功

ZIP 经典的已知（部分）明文攻击。bkcrack 破解一下就好了。

## Dark Room

### 第一问

要求以高于指定 sanity 通关。提示是 roll help 来获取足够的 sanity，但这里有个非预期解，用过钥匙打开的有门的房间可以继续用钥匙打开刷 sanity（因为使用钥匙时只判断了房间有没有门），所以刷一会就可以了。

### 第二问

通过报错泄露了一部分源代码：

```python
Traceback (most recent call last):
    File "dark_room/player.py", line 249, in <module>
    248:   while flag_number:
    249:      choice = int(self.recv(b"Guess my public key (give me a number): ").decode())
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    250:      if flag_number & 1:
    251:          p = getStrongPrime(2048)
    252:          q = getStrongPrime(2048)
    253:      flag_number >>= 1
```

可以看到会遍历 `flag_number` 的每一位，如果是 1 就生成两个 2048 位的大素数。生成大素数是很消耗时间的，也会明显感觉到终端的卡顿，所以可以用这个特性来判断 `flag_number` 的每一位是 0 还是 1，然后拼接起来就是 flag 了。属于侧信道攻击的范畴。

```python

import time
import subprocess as sp
from time import sleep

CMD = "nc prob16.geekgame.pku.edu.cn 10016".split()
TOKEN = "..."


p = sp.Popen(CMD, stdin=sp.PIPE, stdout=sp.PIPE, stderr=sp.PIPE)


def p_write(s: str, endstr='\n'):
    p.stdin.write((s + "\n").encode("utf-8"))
    p.stdin.flush()
    while line := p.stdout.readline():
        line = line.decode()
        print("debug:", line, end="")
        if endstr in line:
            print(line, end="")
            break


p_write(TOKEN, 'to quit the application')
p_write('newgame', 'What\'s your name?')
p_write('y')
sleep(2)
p_write('y', 'pickup: Pickup something.')
p_write('n', 'pickup: Pickup something.')
p_write('n', 'pickup: Pickup something.')
p_write('w', 'pickup: Pickup something.')
p_write('w', 'pickup: Pickup something.')
p_write('s', 'pickup: Pickup something.')
p_write('getflag', '========================================================================')

# 接下来需要循环计时，直到退出
time_list = []
while True:
    start = time.time()
    p_write('0', 'Wrong')
    end = time.time()
    time_list.append(end - start)
    print(time_list)
```

跑到报错收集一下 `time_list`，然后用 0.5 秒作为阈值，大于阈值就是 1，小于阈值就是 0，拼接起来十六进制就是 flag 的 ASCII 码了。

## 麦恩·库拉夫特

### 第一问

出生点附近告示牌。

### 第二问

查看地图存档发现文件名是 `r.0.0.mca` 的格式，`r.6.-4.mca` 与别的数字不连续且文件大小较大，可以猜测有 flag。搜索发现这里一个单位是 512 个方块，我用 Amulet 导出了一下存档找了下告示牌，即为 flag。

## Emoji Wordle

利用了 Play framework 是无状态的，所以每个 cookie 作为一个状态都可以被 fork 出无数份，也就没有了尝试数量的限制。

第三问的脚本可以覆盖前两问，所以直接用第三问的脚本就可以了。

```python
import requests
import urllib.parse
import re

cookie = {
    "PLAY_SESSION": "......" # 手动去浏览器复制一下就好
}
alphabet = [chr(i) for i in range(128016, 128144)]

def visit(emojis: str):
    emojis = urllib.parse.quote_plus(emojis)
    url = (
        f'https://prob14.geekgame.pku.edu.cn/level3?guess={emojis}'
    )
    res = requests.get(url, cookies=cookie)
    text = res.text
    return re.findall(r'push\("(.+)"\)', text)[0]

res = '0' * 64

alphabet_used = visit(''.join(alphabet[:64])) + visit(''.join(alphabet[64:]))
for i in range(len(alphabet)):
    if alphabet_used[i] != '🟥':
        # find out its all occurences
        occurences = visit(alphabet[i] * 64)
        for j in range(64):
            if occurences[j] == '🟩':
                res = res[:j] + alphabet[i] + res[j+1:]

print(res)
```

`alphabet` 字母表是多开几次游戏，把每次出现的字符加入某个 `set` 就能得到了。

## 第三新 XSS

这题第二阶段提示给的实在是太多了。。。

### 第一问

> 给 Cookie 设置 Path 并不能带来安全性。[MDN 文档](https://developer.mozilla.org/en-US/docs/web/api/document/cookie#security) 专门有一节来指出其中的问题。

所以开个 `<iframe>` 就好。

### 第二问

> 你需要 [注册一个 Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)，而且要注册到 "/" 这个 scope 上。

所以注册一下 Service Worker，然后在 Service Worker 里面拦截对 "/admin" 的请求即可。会遇到一些响应头的小问题，看报错提示修复就好了。

## 简单的打字稿

需要提取 TypeScript 类型中的 flag。

由于编译到 JavaScript 后，所有的类型都会被擦除，所以需要在编译时用报错提取。

```typescript
type flag1 = 'flag{...}'
type flag2 = object | { new(): { v: () => (a: (a: unknown, b: { 'flag{...}': never } & Record<string, string>) => never) => unknown } }

type ExtractStringFlag<T> = T extends `flag${infer R}` ? R : never;
type type1 = ExtractStringFlag<flag1>;

type ExtractObject<T> = T extends { new(): { v: () => (a: (a: unknown, b: infer R & Record<string, string>) => never) => unknown } } ? R : never;
type type2 = ExtractStringFlag<keyof ExtractObject<flag2>>;

// flag2 类似 flag{...flag...} 格式
// 因此 type2 是 {...flag...} 格式
// 题目限制了输出不能有 flag，所以处理一下
type L = type2 extends `${infer L}f${infer R}` ? L : never;
type R = type2 extends `${infer L}f${infer R}` ? R : never;

// 以下触发报错，输出不能太长，所以每次选一个就好
let a: type1 = 1;
let b: L = 1;
let c: R = 1;
```

## 逝界计划

利用 [Home Assistant](https://www.home-assistant.io/) 的漏洞读取远程磁盘上的 `/flag.txt`。

提示限定了 nmap 集成后就很简单了。添加 nmap 集成，发现可以自定义它的参数，输入设置成 `/flag.txt`，输出设置成 Home Assistant 的日志文件，然后等待 nmap 运行，就能在日志文件中看到 flag 了。

## 非法所得

### 第一问

自定义 clash 配置文件的 proxy-providers 导入本地的 `/app/profiles/flag.yml` 就好。

## 汉化绿色版免费下载

kirikiri 解包。需要注意有个文件记录了所有选项的选择次数。

后面题目是 binary 和 algo，几乎没有完整做出来，就不写了。