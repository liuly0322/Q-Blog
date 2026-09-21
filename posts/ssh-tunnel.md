---
title: SSH Tunnel 连接远程服务
date: 2022-09-07 10:29:58
tags: [ssh]
category: web
---

算是一个 ssh 的小 trick

有的时候我们在开发过程中是 ssh 连接远程开发服务器完成的，这个时候启动服务，往往就会开一个

```shell
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://***.**.***.0:5173/
```

之类的服务在服务器上

如果服务器有公网 IP，那自然可以通过公网 IP 来访问，当没有公网 IP 我们又需要在本地预览效果时呢？

其实也可以通过 ssh 完成

<!-- more -->

简单来说，ssh 绑定本地的某个端口到远程服务器的服务端口即可，这样本地即可访问远程服务器提供的服务

以上需求对应：

```shell
ssh -i ~/.../密钥文件.pem -N -L 本地port:127.0.0.1:服务器port root@服务器url或IP
```

其中 `127.0.0.1` 也即为本地的 localhost 地址，这样我们就可以通过本地的 `localhost:port` 或者 `127.0.0.1:port` 来访问远程服务

## 注意

需要注意的是，远程服务需要在 0.0.0.0 上启动，该 IP 可用于外部网络接口

例如，对于 `Vite` 而言：

```shell
pnpm dev --host 0.0.0.0
```

添加 `--host` 参数以指定

这样一来本地网页就可以看到预览了

## 用途

多端都可以预览，例如安卓可以使用 `termux` 来使用 `ssh`，这下有个安卓板子就可以开发了

- VSCode 有网页版好文明
- ~~Electron 是坏文明~~
- ~~苹果板子应该也可以，但我没有~~

## SSH 其他用途

还可以用来做 `proxy` 或者使用跳板机

直接抄 `tldr` 了

```shell
# 代理
- SSH tunneling: Dynamic port forwarding (SOCKS proxy on `localhost:1080`):
  ssh -D {{1080}} {{username}}@{{remote_host}}

# 端口转发
- SSH tunneling: Forward a specific port (`localhost:9999` to `example.org:80`) along with disabling pseudo-[T]ty allocation and executio[N] of remote commands:
  ssh -L {{9999}}:{{example.org}}:{{80}} -N -T {{username}}@{{remote_host}}

# 使用跳板机
- SSH jumping: Connect through a jumphost to a remote server (Multiple jump hops may be specified separated by comma characters):
  ssh -J {{username}}@{{jump_host}} {{username}}@{{remote_host}}

# SSH Key 自动继承
- Agent forwarding: Forward the authentication information to the remote machine (see `man ssh_config` for available options):
  ssh -A {{username}}@{{remote_host}}
```