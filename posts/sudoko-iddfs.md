---
title: 数独的模拟逻辑解法的实现
date: 2021-06-03 23:38:03
tags: [算法, C/C++]
category: 算法
mathjax: true
tocbot: true
---

本文将主要介绍人工解数独时采用的唯余法的算法实现，并给出将其改造成迭代加深算法时，解所在最低层数的确定。

## 唯余法

> 当数独谜题中的某一个宫格，因为所处的列、行及九宫格中，合计已出现过不同的 8 个数字，使得这个宫格所能填入 的数字，就只剩下那个还没出现过的数字时，我们称这个宫格有唯余解。

可以看到，唯余法就是利用排除法得出数独某个位置可能的唯一解。但在人工用这种方法解数独时，可能会出现以下问题：

1. 只剩唯一解的数独格子难以直接观察得到。采用唯余法观察时，行，列，宫格的重复性都要考虑，~~对人的视力提出了巨大的挑战~~。
2. 可能，而且很可能不存在能直接确定答案的数独格子。比如可能排除到最后，这个格子还剩 4 和 6 能填，确定不了具体需要填哪一个数。

<!-- more -->

但以上两点在计算机算法实现时却可以比较好的解决。对于第一点，计算机可以穷举每一个格子，对于第二点，计算机可以穷举每一个可能性，这就为我们采用唯余法编写程序提供了可行性。

## 算法实现

### 基本思路

采用递归的思路编写程序。这里采用 DFS 遍历所有格子。递归函数 int 类型，有解返回 1，无解返回 0

![流程图](https://i.loli.net/2021/06/03/ikPVKEsLBhedqo4.jpg)

此外，内层每次递归时也要对操作进行回溯，此处不表。

这里列出流程所必需的变量：

- `char sudoko_solve[9][9]`：记录着当前的解
- `char num_can_input[81]`：记录着每个格子还可以放多少数字。0 表示无解，取最大值 127 表示格子已经被填入数字
- `bool mark[81][10]`：记录每个格子是否允许放 1 到 9 的数字。0 空出来，是为了代码简洁性。

在进入正式流程之前，先要对这些数字预处理。这里略去过程。

`sudoko_solve[9][9]` 对于已有数字为该数字，否则为 0。

可能会注意到，这里存在 $9*9$ 和 81 两种数据记录的方法。这是由笔者别的模块的函数写法决定的。

转换关系：对于坐标 $(x,y)$，对应的后者数字为 $9*x+y$。反之，$x = cell / 9, y = cell \% 9$。

### 代码实现

根据上面的说明写出代码：

```cpp
int dfs_ID(bool mark[][10], char* num_can_put, int depth) {
    if (depth> 90) {
        return 0;	//迭代加深，退出递归，目前深度待定
    }
    struct IDDFS_change* queue[81];	//记录填入唯一解数字时造成的改变
    int change_num = 0;	//对应上面的 queue，记录有多少唯一解
    int min = 127, min_index, flag = 0;
    do {
        min = 127; flag = 0;
        for (int i = 0; i < 81; i++) {
            if (num_can_put[i] == 0) {	//无解，回溯后退出
                solve_res = 1;
                for (int i = change_num - 1; i>= 0; i--) {
                    dfs_ID_recall(mark, num_can_put, queue[i]);
                }
                return 0;
            }
            else if (num_can_put[i] == 1) {	//唯一解，填入并记录
                flag = 1;
                queue[change_num] = new IDDFS_change; change_num++;
                for (int j = 1; j <= 9; j++) {
                    if (!mark[i][j]) {
                        dfs_ID_fill(mark, num_can_put, i, j, queue[change_num - 1]);
                        break;
                    }
                }
                continue;	//填入唯一解后，再次进入循环
            }
            else if (num_can_put[i] < min) {	//记录最小值
                min = num_can_put[i];
                min_index = i;
            }
        }
    } while (flag == 1);	//填入了唯一解，需要再搜
    if (min == 127) {	//最小值是 127，意味着每个格子都是唯一解的，也就是找到了数独的解
        solve_res = 2;
        return 1;
    }
    //对 min_index 进入下一层
    int cell = min_index;
    for (int j = 1; j <= 9; j++) {
        if (!mark[cell][j]) {
            struct IDDFS_change* nextlay = new struct IDDFS_change;	//记录改变
            dfs_ID_fill(mark, num_can_put, cell, j, nextlay);
            if (dfs_ID(mark, num_can_put, depth + 1)) {	//填入
                return 1;
            }
            dfs_ID_recall(mark, num_can_put, nextlay);	//无解，回溯
        }
    }
    for (int i = change_num - 1; i>= 0; i--) {	//回溯填入的唯一解
        dfs_ID_recall(mark, num_can_put, queue[i]);
    }
    return 0;
}
```

这里用 `flag` 记录是否有只有唯一解的格子。

填入和回溯函数借助了一个结构体：`struct IDDFS_change`。

```cpp
struct IDDFS_change {
	int cell_fill,num_fill;
	int cell_num_can_put;
	int queue[30], change_num;
};
```

这里仅仅是用于储存需要回溯的一些数据，所以不需要用类，结构体足矣。

`dfs_ID_fill` 用于填入数字，并记录信息到 p 指针，便于回溯。

```cpp
void dfs_ID_fill(bool mark[][10], char* num_can_put, int cell, int num, struct IDDFS_change* p) {
    p->cell_fill = cell; p->num_fill = num;
    p->cell_num_can_put = num_can_put[cell]; p->change_num = 0;	//记录回溯需要信息
    int x = cell / 9, y = cell % 9;
    sudoko_solve[x][y] = num;	//数字填入该格子
    num_can_put[cell] = 127;
    for (int k = 0; k < 9; k++) {
        if (!mark[9 * x + k][num] && !sudoko_solve[x][k]) {
            p->queue[p->change_num] = 9 * x + k; p->change_num++;	//记录改变
            mark[9 * x + k][num] = true;
            num_can_put[9 * x + k]--;
        }
    }
    for (int k = 0; k < 9; k++) {
        if (!mark[9 * k + y][num] && !sudoko_solve[k][y]) {
            p->queue[p->change_num] = 9 * k + y; p->change_num++;
            mark[9 * k + y][num] = true;
            num_can_put[9 * k + y]--;
        }
    }
    int i_start = x / 3 * 3, j_start = y / 3 * 3;
    for (int dx = 0; dx < 3; dx++) {
        for (int dy = 0; dy < 3; dy++) {
            if (!mark[(i_start + dx) * 9 + (j_start + dy)][num] &&
                !sudoko_solve[(i_start + dx)][(j_start + dy)]) {
                p->queue[p->change_num] = (i_start + dx) * 9 + (j_start + dy);
                p->change_num++;
                mark[(i_start + dx) * 9 + (j_start + dy)][num] = true;
                num_can_put[(i_start + dx) * 9 + (j_start + dy)]--;
            }
        }
    }
}
```

`dfs_ID_recall` 用于回溯。

```cpp
void dfs_ID_recall(bool mark[][10], char* num_can_put, struct IDDFS_change* p) {
    int x = p->cell_fill / 9, y = p->cell_fill % 9;
    num_can_put[9 * x + y] = p->cell_num_can_put;
    sudoko_solve[x][y] = 0;
    for (int i = 0; i < p->change_num; i++) {
        num_can_put[p->queue[i]]++;
        mark[p->queue[i]][p->num_fill] = false;
    }
    delete p;
}
```

## 算法的迭代加深改进

这里可以考虑随机生成数独并利用该算法求解，记录：出现解时最低到达深度。

随机生成数独是指在 $9*9$ 的格子上随机放入指定数量的数字（确保不矛盾，但未必有解）

因此，这里需要更改放入数字数量，反复实验，实验结果如下所示：

- 初始 17 数字：

  21，20，20，21，24，20，21，27，21，27，21，24，24，21，19，21，20，23，28，24，25，23。

- 初始 25 数字：

  12，10，16，9，12，9，13，6，13，7，12，11，10，8，12，10，5，3，17，7。

- 初始 30 数字：

  3，3，5，4，5，3，3，3，3，2，8，11，6，2，10，5，4，4，2，3。

可以看出，大部分情况，设置搜索深度为 24 已经能够找到目标，这样的搜索深度并不大。如果没找到目标，全部遍历即可。

本算法在复杂度上和朴素 dfs 都是 $O(c^n)$ 级别，$n=81$，但是相比朴素 dfs 大幅降低了 c，所以即便穷举所耗时间也比较优秀。

故可以这样将算法改进为迭代加深版本：

```cpp
int Sudoko::dfs_ID(bool mark[][10], char* num_can_put, int depth, bool full_search) {
    if (depth> 24 && !full_search) {
        solve_res = 1;
        return 0;	//迭代加深，退出递归。
    }
    ...
}
```

增加了一个参数 `bool full_search` 用于表示当前是否需要全部搜索。至此，就完成了本次实验题关于实现迭代加深 DFS 算法的要求。
