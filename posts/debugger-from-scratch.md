---
title: 从零开始的调试器编写！
date: 2024-02-22 13:18:59
tags: [os, binary, rust]
category: 笔记
mathjax: true
tocbot: true
---

最近闲来无事，捡起了两年前在学操作系统和 Rust 时候开坑的 Stanford CS 110L 课程。做了一遍发现里面的 [Project 1: The DEET Debugger](https://reberhardt.com/cs110l/spring-2020/assignments/project-1/)（[代码仓库](https://github.com/reberhardt7/cs110l-spr-2020-starter-code)）还是挺有意思的，写篇文章记录一下。

有点标题党了，因为课程已经提供了代码框架，大概不能算是从零开始了（<ゝω・）☆

<!-- more -->

> 最新版的课程主页未公开初始代码仓库，因此上面给出的是 2020 年的代码仓库。由于 `Cargo.toml` 的存在，Exercises 和 project1 都不需要修改即可食用。依赖升级/project 2 的适配可以参考 [CS 自学指南：CS110L](https://csdiy.wiki/%E7%BC%96%E7%A8%8B%E5%85%A5%E9%97%A8/CS110L) 及 [fung-hwang/CS110L-2020spr - GitHub](https://github.com/fung-hwang/CS110L-2020spr)。我的仓库由于 project2 鸽了，不公开了。

参考：

- [CS 110L: Safety in Systems Programming](https://reberhardt.com/cs110l/spring-2020/)
- [ptrace(2) — Linux manual page](https://man7.org/linux/man-pages/man2/ptrace.2.html)

## 调试器与子进程的初遇

> （Milestone 1: Run the inferior）让调试器启动子进程，并使用 `ptrace` 系统调用观察和控制子进程的执行。
>
> （本文中的子进程一般指代的都是被调试的进程。）

`ptrace` 系统调用可以用于跟踪指定线程的系统调用、指令执行等行为，并在触发特定事件时通过信号暂停子进程的执行。此时，调试器可以通过 `waitpid` 获取子进程的状态，并读取或修改子进程的内存、寄存器等信息，最后通过 `ptrace` 继续子进程的执行。

启动子进程需要的代码：

```rust
use crate::dwarf_data::DwarfData;
use nix::sys::ptrace;
use nix::sys::signal;
use nix::sys::wait::{waitpid, WaitPidFlag, WaitStatus};
use nix::unistd::Pid;
use std::collections::HashMap;
use std::mem::size_of;
use std::os::unix::process::CommandExt;
use std::process::Child;
use std::process::Command;

// ......

/// This function calls ptrace with PTRACE_TRACEME to enable debugging on a process. You should use
/// pre_exec with Command to call this in the child process.
fn child_traceme() -> Result<(), std::io::Error> {
    ptrace::traceme().or(Err(std::io::Error::new(
        std::io::ErrorKind::Other,
        "ptrace TRACEME failed",
    )))
}

pub struct Inferior {
    child: Child,
    // ignore next line for now
    breakpoints: HashMap<usize, Breakpoint>,
}

impl Inferior {
    /// Attempts to start a new inferior process. Returns Some(Inferior) if successful, or None if
    /// an error is encountered.
    pub fn new(target: &str, args: &Vec<String>) -> Option<Inferior> {
        let mut command = Command::new(target);
        let command = command.args(args);
        unsafe { command.pre_exec(child_traceme) };

        let command = command.spawn().ok()?;

        let ret = Inferior { child: command };
        ret.wait(None).map(|_| ret).ok()
    }
}
```

`Inferior` 是 GDB 对被调试的下级对象的称呼，这里可以简单理解成被调试进程。`Inferior::new` 会启动一个新的子进程，并在子进程运行前调用 `ptrace::traceme` 以启用调试。此时子进程会收到 `SIGTRAP` 而暂停执行。调试器通过 `waitpid` 获取子进程的状态，并进行错误检查。如果一切正常，说明子进程已经准备就绪了。

开始（继续）执行子进程的代码：

```rust
impl Inferior {
    pub fn go(&self) -> Result<Status, nix::Error> {
        nix::sys::ptrace::cont(self.pid(), None)?;
        // 开始（继续）执行，直到子进程再次中断/退出
        self.wait(None)
    }
}
```

正常情况下，调试器会 `wait` 到子进程的最终退出，但如果在子进程暂停时退出调试器，子进程会变成僵尸进程。因此，调试器需要在退出时杀死子进程。

```rust
impl Inferior {
    pub fn kill(&mut self) {
        println!("Killing running inferior (pid {})", self.pid());
        // kill child
        self.child.kill().unwrap();
        // reap zombies
        self.child.wait().unwrap();
    }
}
```

好，接下来我们可以调用 `Inferior` 来尝试创建并启动一个新的子进程了。

为此，我们介绍程序的主要结构体 `Debugger`，包含了输入处理、历史存储等模块（现在先不用关心这些细节），`Debugger::run` 则是程序的主体逻辑。

在 `Debugger::run` 里，我们可以在用户输入运行程序的命令后，创建一个新的 `Inferior` 对象，然后调用 `Inferior::go` 方法，等待子进程再次中断或退出，此时根据子进程的状态码进行相应的处理。

> 附：这个调试器的使用方法：
>
> `deet <target>`：运行调试器，通过参数指定要调试的目标程序，此时进入调试器的 REPL 模式
> 
> `> run <args>`：在调试器的 REPL shell 内，运行目标程序，`args` 为目标程序的参数 

```rust
pub struct Debugger {
    target: String,
    history_path: String,
    readline: Editor<()>,
    inferior: Option<Inferior>,
    debug_data: DwarfData,
}

impl Debugger {
    pub fn run(&mut self) {
        loop {
            match self.get_next_command() {
                DebuggerCommand::Run(args) => {
                    if let Some(x) = self.inferior.as_mut() {
                        x.kill()
                    }
                    if let Some(inferior) = Inferior::new(&self.target, &args, &self.breakpoints) {
                        self.inferior = Some(inferior);
                        self.go()
                    } else {
                        println!("Error starting subprocess");
                    }
                }
                DebuggerCommand::Quit => {
                    if let Some(x) = self.inferior.as_mut() {
                        x.kill()
                    }
                    return;
                }
            }
        }
    }

    fn go(&mut self) {
        match self
            .inferior
            .as_mut()
            .unwrap()
            .go()
            .expect("Error handling subprocess")
        {
            Status::Stopped(signal, rip) => {
                println!("Child stopped (signal {})", signal);
                // ignore next line for now
                if let Some(file) = self.debug_data.get_line_from_addr(rip) {
                    println!("Stopped at {}", file);
                }
            }
            Status::Exited(exit_code) => {
                println!("Child exited (status {})", exit_code);
                self.inferior = None
            }
            Status::Signaled(signal) => {
                println!("Child exited due to signal {}", signal);
                self.inferior = None
            }
        };
    }
}
```

根据 CS 110L 官网（下略），此时的预期输出:

```shell
🍌 ./container cargo run samples/sleepy_print
    Finished dev [unoptimized + debuginfo] target(s) in 1.94s
     Running `target/debug/deet samples/sleepy_print`
(deet) r 3
0
1
2
Child exited (status 0)
(deet) r 3
0
1
2
Child exited (status 0)
(deet)
```

## 死锁之魂推动遇难船

> （Milestone 2: Stopping, resuming, and restarting the inferior）使调试器能够暂停、继续、重启子进程。

我们希望能够在子进程死锁或其他类似情况时，能够主动暂停子进程的执行，进行一些调试工作，并且之后决定是恢复执行还是重启一个新的子进程。

首先在 `debugger_command.rs` 中增加 c/cont/continue 命令。由于逻辑简单，这里不再展示。

核心部分就是处理实现 continue 命令了：

```rust
impl Debugger {
    pub fn run(&mut self) {
        loop {
            match self.get_next_command() {
                ..........
                DebuggerCommand::Cont => {
                    if self.inferior.is_none() {
                        println!("There is no subprocess running now");
                        continue;
                    }
                    self.go()
                }
            }
        }
    }
}
```

和 `Debugger::run` 相比，只是少了创建新的 `Inferior` 对象的步骤。

恢复执行/重启新的子进程是 trivial 的，实际执行仍然是调试器的 REPL shell 中的 run/continue 命令，所以这里的关键是处理好子进程的状态，对恢复执行而言，就是要判断子进程是否已存在，对重启而言，就是如果子进程已经存在，要先 kill 掉。

这部分逻辑已经在第一节实现。

此时的预期输出：

```shell
🍌 ./container cargo run samples/sleepy_print
   Compiling deet v0.1.0 (/deet)
    Finished dev [unoptimized + debuginfo] target(s) in 29.80s
     Running `target/debug/deet samples/sleepy_print`
(deet) run 5
0
1
^CChild stopped (signal SIGINT)
(deet) run 5
Killing running inferior (pid 204)
0
1
^CChild stopped (signal SIGINT)
(deet)
```

打开另一个终端：

```shell
🍌 docker exec deet ps aux | grep sleepy_print
501          1  0.6  0.2  16292  4448 pts/0    Ss+  10:29   0:00 target/debug/deet samples/sleepy_print
501        210  0.0  0.0   4504   704 pts/0    t+   10:29   0:00 samples/sleepy_print 5
```

> There should only be one samples/sleepy_print process. If you see multiple, or you see a <defunct> entry, then you are not killing or reaping child processes properly.

## 那个调用栈滔滔不绝的表达爱意

> （Milestone 3: Printing a backtrace & Milestone 4: Print stopped location）打印子进程的调用栈。

这一节，我们正式开始调试工作了。让我们首先看看在子进程暂停或退出时的一些运行信息，例如调用栈（即子进程寄在哪了）。

同上，省略 bt/back/backtrace 命令的增加。

为了得到调用栈的函数名和行号，我们需要获得调试信息。

为了引入框架提供的库，需要在 `main.rs` 中增加：

```rust
mod dwarf_data;
mod gimli_wrapper;
```

然后把调试信息保存在 `Debugger` 结构体中。

```rust
// Debugger::new 中
let debug_data = match DwarfData::from_file(target) {
    Ok(val) => val,
    Err(DwarfError::ErrorOpeningFile) => {
        println!("Could not open file {}", target);
        std::process::exit(1);
    }
    Err(DwarfError::DwarfFormatError(err)) => {
        println!("Could not debugging symbols from {}: {:?}", target, err);
        std::process::exit(1);
    }
};
```

backtrace 命令中可以把调试信息传给 `Inferior::print_backtrace` 方法，打印出调用栈的函数名和行号。

```rust
impl Debugger {
    pub fn run(&mut self) {
        loop {
            match self.get_next_command() {
                ..........
                DebuggerCommand::BackTrace => {
                    if let Some(inferior) = self.inferior.as_ref() {
                        if let Err(err) = inferior.print_backtrace(&self.debug_data) {
                            println!("Error printing backtrace: {:?}", err);
                        }
                    } else {
                        println!("There is no subprocess running now")
                    }
                }
            }
        }
    }
}

impl Inferior {
    pub fn print_backtrace(&self, debug_info: &DwarfData) -> Result<(), nix::Error> {
        let mut rip: usize = ptrace::getregs(self.pid())?.rip as usize;
        let mut rbp = ptrace::getregs(self.pid())?.rbp as usize;

        loop {
            debug_info.print_function_and_line_from_addr(rip);
            let function_name = debug_info
                .get_function_from_addr(rip)
                .ok_or(nix::Error::Sys(nix::errno::Errno::EINVAL))?;
            if function_name == "main" {
                break;
            }
            rip = ptrace::read(self.pid(), (rbp + 8) as ptrace::AddressType)? as usize;
            rbp = ptrace::read(self.pid(), rbp as ptrace::AddressType)? as usize;
        }
        Ok(())
    }
}
```

这里的逻辑是遍历调用帧栈，伪代码（不理解的话可以先了解下 x86 的帧栈内存布局）：

```
instruction_ptr = %rip
base_ptr = %rbp
while true:
    print function/line number for instruction_ptr
    if function == "main":
        break
    instruction_ptr = read memory at base_ptr + 8
    base_ptr = read memory at base_ptr
```

打印代码：

```rust
impl DwarfData {
    #[allow(dead_code)]
    pub fn print_function_and_line_from_addr(&self, curr_addr: usize) {
        let function = self.get_function_from_addr(curr_addr);
        let line = self.get_line_from_addr(curr_addr);
        match (function, line) {
            (Some(function), Some(line)) => println!("{} ({})", function, line),
            _ => (),
        }
    }
}
```

预期输出：

```shell
👾 ./container cargo run samples/segfault
    Finished dev [unoptimized + debuginfo] target(s) in 2.43s
     Running `target/debug/deet samples/segfault`
(deet) r
Calling func2
About to segfault... a=2
Child stopped (signal SIGSEGV)
Stopped at /deet/samples/segfault.c:5
(deet) back
func2 (/deet/samples/segfault.c:5)
func1 (/deet/samples/segfault.c:12)
main (/deet/samples/segfault.c:15)
(deet)
```

## 断点是做了一个顽固朋友的梦

> （Milestone 5: Setting breakpoints & Milestone 6: Continuing from breakpoints & Milestone 7: Setting breakpoints on symbols）设置并继续断点。

本节已经是最后一节了，将支持调试器设置特定地址/函数名/行号的断点并恢复执行。函数名和行号可以通过调试信息转化成地址，因此这里的核心是实现特定地址断点的设置和恢复执行。

设置断点并恢复执行看起来好像和之前的 continue 命令差不多，但实际上要复杂一些。因为断点是通过修改子进程的内存和指令寄存器 RIP 来实现的，所以相信读完本节，你也能明白常见调试器的修改内存/寄存器等功能的原理。至此，调试器的核心功能均已经实现了，可喜可贺，可喜可贺。

同上，省略 b/break 命令的增加。

注意 `Debugger` 结构体中需要增加断点的存储，这是因为我们需要在 `Inferior` 创建前就支持断点的设置。

```rust
impl Debugger {
    pub fn run(&mut self) {
        loop {
            match self.get_next_command() {
                ..........
                DebuggerCommand::BreakPoint(arg) => {
                    if let Some(addr) = Debugger::parse_address(&arg)
                        .or(self.parse_line_number(&arg))
                        .or(self.parse_function_name(&arg))
                    {
                        self.set_breakpoint(addr)
                    } else {
                        println!("Invalid breakpoint location: {}", arg)
                    }
                }
            }
        }
    }

    fn set_breakpoint(&mut self, addr: usize) {
        println!("Set breakpoint {} at 0x{:x}", self.breakpoints.len(), addr);
        self.breakpoints.push(addr);
        if let Some(inferior) = self.inferior.as_mut() {
            if let Err(err) = inferior.set_breakpoint(addr) {
                println!("Error setting breakpoint: {:?}", err);
            }
        }
    }

    fn parse_address(addr: &str) -> Option<usize> {
        if !addr.starts_with('*') {
            return None;
        }
        let addr = &addr[1..];
        let addr_without_0x = if addr.to_lowercase().starts_with("0x") {
            &addr[2..]
        } else {
            addr
        };
        usize::from_str_radix(addr_without_0x, 16).ok()
    }

    fn parse_line_number(&self, line: &str) -> Option<usize> {
        let line = line.parse::<usize>().ok()?;
        self.debug_data.get_addr_for_line(None, line)
    }

    fn parse_function_name(&self, func: &str) -> Option<usize> {
        self.debug_data.get_addr_for_function(None, func)
    }
}
```

可以看到，如果 `Inferior` 还不存在，直接存在 `breakpoints` 中，等 `Inferior` 创建后再设置断点。但如果 `Inferior` 已经存在，就还需要通知 `Inferior` 设置断点（因为 `Inferior` 初始化时只能传入初始化时的 `breakpoints` 断点数组）。

下面我们来看 `Inferior` 中怎么设置断点：

```rust
fn align_addr_to_word(addr: usize) -> usize {
    addr & (-(size_of::<usize>() as isize) as usize)
}

#[derive(Clone)]
struct Breakpoint {
    orig_byte: u8,
}

pub struct Inferior {
    child: Child,
    breakpoints: HashMap<usize, Breakpoint>,
}

impl Inferior {
    // 需要更改 Inferior::new，对传入的每个断点地址设置断点
    pub fn set_breakpoint(&mut self, addr: usize) -> Result<(), nix::Error> {
        let orig_byte = self.write_byte(addr, 0xcc)?;
        self.breakpoints.insert(addr, Breakpoint { orig_byte });
        Ok(())
    }

    fn write_byte(&mut self, addr: usize, val: u8) -> Result<u8, nix::Error> {
        let aligned_addr = align_addr_to_word(addr);
        let byte_offset = addr - aligned_addr;
        let word = ptrace::read(self.pid(), aligned_addr as ptrace::AddressType)? as u64;
        let orig_byte = (word >> (8 * byte_offset)) & 0xff;
        let masked_word = word & !(0xff << (8 * byte_offset));
        let updated_word = masked_word | ((val as u64) << (8 * byte_offset));
        ptrace::write(
            self.pid(),
            aligned_addr as ptrace::AddressType,
            updated_word as *mut std::ffi::c_void,
        )?;
        Ok(orig_byte as u8)
    }
}
```

可以看到，设置断点实际就是对这个地址写入了 `0xcc`，这是 x86 的 `int3` 单字节指令，会触发 `SIGTRAP` 信号，从而暂停子进程的执行，达到设置断点的目的。同时，我们还记录了原来的字节（作为 `write_byte` 的返回值），这是为什么呢？

这就涉及到从断点恢复执行的机制。我们需要首先恢复断点的原始字节，然后把指令寄存器 RIP 减一（因为 `int3` 是单字节指令）以指向原始指令，这样就可以执行原始指令了。但注意，此时因为 `int3` 被还原了，所以该断点也就相应失效了，下次再执行到这里时程序不会停止。为了让断点保持有效，我们需要首先单步执行断点处原始指令，然后再次向该断点地址的内存写入 `0xcc` 以重新启用断点。接下来可以正常恢复执行了。

```rust
impl Inferior {
    pub fn go(&mut self) -> Result<Status, nix::Error> {
        let mut regs = ptrace::getregs(self.pid())?;
        let rip = regs.rip as usize;
        if let Some(bp) = self.breakpoints.get(&(rip - 1)) {
            self.write_byte(rip - 1, bp.orig_byte)?;
            regs.rip -= 1;
            ptrace::setregs(self.pid(), regs)?;
            ptrace::step(self.pid(), None)?;
            self.wait(None)?;
            self.write_byte(rip - 1, 0xcc)?;
        }

        nix::sys::ptrace::cont(self.pid(), None)?;
        self.wait(None)
    }
}
```

完结撒花！ε=ε=(ノ≧∇≦)ノ

## 后记

没想到肝一篇逐 patch 记录的文章还是挺有意思的，虽然这篇文章的内容并不是很有深度。不过，这篇文章的内容也算是我在学习操作系统和 Rust 时的一个小小的总结吧。

> 以上是 copilot 抢答的，我只是想说逐 patch 写太累了。。。尤其是写作的时候还调整了一下部分错误处理的实现，需要逐个 patch 移植。

每个小章节的标题 neta 了 [GOSICK -ゴシック-](https://bangumi.tv/subject/9781)，很浪漫的一部动画，推荐一下。

如果你能看到这里，向你表示感谢！
