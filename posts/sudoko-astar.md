---
title: 数独的 A* 算法及其实现
date: 2021-06-05 22:19:04
tags: [算法, C/C++]
category: 算法
mathjax: true
tocbot: true
---

接上一篇博客：[数独的模拟逻辑解法的实现](http://home.ustc.edu.cn/~liuly0322/blog/2021/06/03/sudoko-iddfs/)，本篇博客将介绍数独的 A\* 算法求解。

## A\* 算法

### 原理分析

A\* 算法是游戏中寻找路径的一种常见解法，它能在保证找到最短路径的同时，以一种较为节省计算资源开销的方式达到这一目的。关于理论分析，可以见斯坦福计算机系写的一篇 [算法介绍](https://blog.csdn.net/denghecsdn/article/details/78778769)，或者见它的 [中文译文](https://dev.gameres.com/Program/Abstract/Arithmetic/AmitAStar.mht)，这个网页似乎有点兼容性问题，所以你也可以查看 [csdn 的转载](https://blog.csdn.net/b2b160/article/details/4057781)。

<!-- more -->

~~大概只有在这个时候我才能感觉到中文互联网 csdn 无限套娃的一点好处~~

概括一点来说，A\* 算法结合了 **Dijkstra 算法** 和 **最佳优先搜索算法** 的优点。二者都从普通的广度优先搜索演化而来，其中前者是按照离起始点的有权路径距离来进行搜索的，能确保找到最短路径，而后者采取了贪心策略，估计了当前点和目标点的距离，一般能较快的找到终点。这种贪心策略被称为 **启发式方法**。

可以认为，Dijkstra 算法按照点的 $g(n)$ 值作为依据进行搜索，$g(n)$ 是距离原点距离（可以带权）。

而最佳优先搜索算法按照点的 $h(n)$ 值作为搜索依据，$h(n)$ 是从结点到目标点的距离（只能估计）。

而 A\* 算法就是对这二者进行综合，它进行搜索的依据是点的 $f(n)=g(n)+h(n)$ 值。这样一来，可以在保证找到最短路径的同时尽可能减少计算开销。

以上，在进行寻路算法时，我们使用了 **距离**一词，由于不同结点之间的“距离”可能是不同的，也就是这些点可以被抽象成有权图，因此，有时，也会使用用 **代价** 一词来表示有权的距离。此外，对于简单的二维平面迷宫问题，选取 $f(n)=g(n)+h(n)$ 是既合理又比较快速的，但是更一般情况，只需要 $f(n)$ 与 $g(n)$ 和 $h(n)$ 都具有正相关性即可，根据 $g(n)$ 和 $h(n)$ 的权重的大小，A\* 算法会表现出结果更精准或运算更快，也就是更向 Dijkstra 算法或最佳优先搜索算法退化的特性。

### 具体实现

这里引用 Red Blob Games[这篇文章](https://www.redblobgames.com/pathfinding/a-star/introduction.html) 里的 Python 代码（~~为什么，因为他写的实在是太好了~~）。

顺便一提，作者的博客有很多很有意思的可视化内容，有兴趣可以自己去玩玩。

```python
frontier = PriorityQueue()
frontier.put(start, 0)
came_from = dict()
cost_so_far = dict()
came_from[start] = None
cost_so_far[start] = 0

while not frontier.empty():
   current = frontier.get()

   if current == goal:
      break

   for next in graph.neighbors(current):
      new_cost = cost_so_far[current] + graph.cost(current, next)
      if next not in cost_so_far or new_cost <cost_so_far[next]:
         cost_so_far[next] = new_cost
         priority = new_cost + heuristic(goal, next)
         frontier.put(next, priority)
         came_from[next] = current
```

虽然笔者的大作业打算用 C++ 完成，~~但是这种简单易懂的 Python 代码还是爱了爱了~~。这里用 cost_so_far 表明起点到当前点的代价，用 priority 表示当前点到终点的代价。frontier 是一个优先队列，如果不明白为什么叫 frontier 可以自行脑补一下朴素宽度优先搜索算法的遍历过程。

代码实现有一句需要比较注意：`if next not in cost_so_far or new_cost < cost_so_far[next]:`，访问过的点不应该再次访问，除非再次到达这一点时所用代价降低了。

## 数独求解中 A\* 算法的应用

### 问题分析

要想利用 A\* 算法求解数独，首先需要能把数独的求结过程抽象成图上的一个个结点。不妨认为数独的每个状态都是一个结点，那么这些结点具有以下几个特点：

1. 单向性：永远是填入 $n$ 个数字的指向填入 $n+1$ 个数字的结点。
2. 层次性：由填入数字的个数可以对结点进行分层。
3. 每个结点所连接的结点数目是很大的。

对于第三条特别考虑，这意味着算法实现时必须考虑剪枝，否则占用的时间，空间都会很大。而正因为数独具有第二条所示的层次性，我们做下列考虑：

假设数独有解，初始给定 $n$ 个数字，那么对于一个可行的解法，考虑数字放入先后顺序，一定对应一条从第 $n$ 层一直到第 81 层的路径，但如果不考虑数字放入先后顺序，那么一共应该有 $(81-n)!$ 条路径。我们只关心数独的解，所以希望将这些路径归一。在数学上，这有个很好的解释：假设我们每一层都指定一个格子，这一层只能在这个格子放数字，那么刚好就指定了一条特定的路径，且这样做应该是不重复不遗漏。下面就要考虑每一层应该在哪个格子放入数字：这就涉及到了笔者 [上一篇博客](http://home.ustc.edu.cn/~liuly0322/blog/2021/06/03/sudoko-iddfs/) 的内容：每次选择当前可填入数字最少的格子填数字。

有了这个想法之后，我们来选择 $f(n)=g(n)+h(n)$。在这个案例中，代价更应该作为计算资源的代价理解，而不是结点间距离，毕竟每一层结点间距离都是 1，不好作为判断依据。计算资源可以取每次选择的选择最少的结点的选择数。这代表了从一个结点出发，需要消耗多少资源（循环多少次，到达多少个新的结点，总之是这个意思）。

那么 $g(n)$ 的选择已经呼之欲出了。对于初始结点，取 $g(n)=0$，对于结点 P，如果选择填入数字的格子有 $k$ 个选择，那么对由这个选择到达的新的结点 Q，$g(Q)=g(P)+k$。

但是 $h(n)$ 的选择我们只能近似做一个估计。这里不加证明的给出作者的一个估计式：设当前局面中，未填入数字的格子为 $a_1,a_2,...,a_n$，每个格子有 $b_1,b_2,...,b_n$ 种填入数字的选择，可以考虑取 $h(n)=\sum\limits_1^n b_n/4$。

### 代码实现

接下来就可以开始具体编写程序了。

先要编写一个类用于记录当前结点：

```cpp
{
public:
    char num[81];
    char num_can_put[81];
    bool mark[81][10];
    int cost_so_far, cost_to_end, cost;
    int num_now;    //当前一共多少数字
    //运算符重载
    friend bool operator<(SudokuNode n1, SudokuNode n2) {
        return n1.cost > n2.cost;
    }
    //构造函数
    SudokuNode();
    SudokuNode(char src[][9]);
    //运算函数
    static void mark_cell(int cell, bool* mark, char* num); //标记 cell 可放数字
    int fill(int cell, int num_fill);    //填数，返回 0 代表无解
    void cal_cost(int increase);    //计算 cost_to_end 和 cost 总
    void get_current_num(char to_num[][9]); //将当前结点信息输出
};
```

部分变量意义参见 [上一篇博客](http://home.ustc.edu.cn/~liuly0322/blog/2021/06/03/sudoko-iddfs/)。具体函数实现此处不表。

A\* 搜索函数如下所示：

```cpp
int Sudoku::search_astar() {
    SudokuNode current(sudoku_num), next;
    std::priority_queue<SudokuNode> frontier;
    frontier.push(current);
    while (!frontier.empty()) {
        current = frontier.top();
        frontier.pop();
        if (current.num_now == 81) {
            current.get_current_num(sudoku_solve);
            return 1;
        }
        // 接下来需要遍历所有可能节点。由于相互的连通性，只要从最少可能的找即可
        int min = 127, min_index;
        for (int i = 0; i < 81; i++) {
            if (current.num_can_put[i] < min) {	// 记录最小值
                min = current.num_can_put[i];
                min_index = i;
            }
        }
        // 对这个格子生成所有可能的新节点，并加入优先队列
        for (int j = 1; j <= 9; j++) {
            if (!current.mark[min_index][j]) {
                next = current;
                if (next.fill(min_index, j)) {
                    next.cal_cost(min);
                    frontier.push(next);
                }
            }
        }
    }
    return 0;
}
```
