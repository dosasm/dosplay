# Lei Jun's RAMinit (RI.com)

- copied from https://github.com/doyou/RAMinit/
- video introduction: https://www.bilibili.com/video/BV1uF411k7RH
- Step1: tasm RI
- Step2: tlink/t RI
- Step3: RI.com generated, Enjoy!

## Introduction By Gemini

Lei Jun's Code RAMinit (RI.com) is a utility program for DOS that removes TSRs (Terminate and Stay Resident programs) from memory. 

**TSRs** are programs that load themselves into memory and then stay resident even after the main program has finished running. They can be used for a variety of purposes, such as providing background services or hotkey functionality.

### Why remove TSRs?

TSRs can consume valuable system resources, such as memory and CPU time. In some cases, they can also cause conflicts with other programs. Lei Jun's Code RAMinit provides a way to remove TSRs from memory, freeing up resources and potentially improving system performance.


## 介绍 by 豆包

### TSR（Terminate and Stay Resident）程序的定义
TSR 即“终止并驻留”程序，它是一种在 DOS 操作系统环境下非常特殊的程序类型。常规程序在执行完主要任务后会完全退出内存，将所占用的系统资源释放。而 TSR 程序在完成主要任务后，并不会完全从内存中撤离，而是会有一部分代码和数据继续驻留在内存里。这部分驻留内容可以持续监听特定的事件，如特定的按键组合、硬件中断信号等，一旦检测到相应事件，就会立即被激活并执行特定操作。

### 需要该工具移除 TSR 程序的原因
#### 1. 释放系统资源
- **内存占用**：TSR 程序驻留在内存中，会持续占用一定的内存空间。随着系统中运行的 TSR 程序数量不断增加，可用内存会逐渐减少，这可能导致系统运行速度变慢，甚至影响其他程序的正常运行。例如，像早期的鼠标驱动程序、屏幕保护程序等常常以 TSR 形式存在，如果同时运行多个这样的程序，内存很快就会变得紧张。
- **CPU 资源**：部分 TSR 程序可能会在后台持续运行一些监控或处理任务，这会占用 CPU 的处理时间，降低 CPU 的使用效率，进而影响整个系统的性能。

#### 2. 解决冲突问题
- **中断冲突**：TSR 程序通常会通过修改系统中断向量来实现其功能。当多个 TSR 程序同时修改同一个中断向量时，就可能会引发中断冲突，导致系统出现异常，如程序崩溃、死机等。例如，两个不同的 TSR 程序都试图拦截键盘中断，就可能会出现输入响应异常的情况。
- **资源竞争**：多个 TSR 程序可能会竞争使用系统的同一资源，如硬件设备、文件句柄等。这可能会导致资源分配混乱，使程序无法正常访问所需资源，从而影响系统的稳定性。

#### 3. 系统清理与恢复
- **程序卸载不完全**：在某些情况下，用户卸载 TSR 程序时可能没有正确操作，导致程序部分代码仍然驻留在内存中。使用专门的工具可以彻底清除这些残留的 TSR 程序，恢复系统的干净状态。
- **临时使用的 TSR 程序**：有些 TSR 程序是用户临时使用的，使用完毕后不再需要。为了保持系统的简洁和高效，需要将这些临时的 TSR 程序从内存中移除。

#### 4. 兼容性问题
- **软件升级或更换**：当用户对操作系统或其他软件进行升级、更换时，某些旧的 TSR 程序可能与新的软件环境不兼容，导致系统出现各种问题。此时，使用该工具移除这些不兼容的 TSR 程序，可以提高系统的兼容性和稳定性。 


