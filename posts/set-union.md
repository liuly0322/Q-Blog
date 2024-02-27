---
title: 集合间并集个数计算
date: 2022-09-09 16:00:49
tags: [C/C++, 算法]
category: 算法
---

来源于西瓜书习题 1.2, 计算若 n 个集合中最多取 k 个集合做并集，则有多少种可能的并集结果

题目内容：

与使用单个合取式来进行假设表示相比，使用“析合范式”将使得假设空间具有更强的表达能力

<!-- more -->

例如：

好瓜 $\iff$ ((色泽=\*)$∧$(根蒂=蜷缩)$∧$(敲声=\*))$∨$((色泽=乌黑)$∧$(根蒂=\*)$∧$(敲声=沉闷))

会把“(色泽=青绿)∧(根蒂=蜷缩)∧(敲声=清脆)”以及“(色泽=青绿)∧(根蒂=蜷缩)∧(敲声=清脆)”都分类为“好瓜”。若使用最多包含 k 个合取式的析合范式来表达下表西瓜分类问题的假设空间，试估算共有多少中可能的假设

给定的数据：西瓜的色泽有 2 种，根蒂和敲声都有 3 种

## 分析

显然总并集数的上界：$2^{2*3*3}=262144$，我们只需要枚举 $k$ 使得最后总并集数达到这一上限即可

首先明确，当 $k = 1$ 时，合法的单个合取式一共有多少种呢？

注意到色泽可以是两种颜色或者通配符，根蒂（敲声）可以是三种根蒂（敲声）或者通配符，因此总数是 $3 * 4 * 4 + 1 = 49$（空集也可以纳入考虑范围）

那么，当 $k=n$ 时，我们理论上只需要遍历 $\sum_{i=1}^nC_{48}^{i}$ 种集合的组合，随后去重即可，但这个数字是非常庞大的：$n=9$ 时，仅

$$C_{48}^{9}=1677106640 = 1.68 \times 10^9$$

[知乎上有一篇文章](https://zhuanlan.zhihu.com/p/355235881)，作者穷举了所有可能，`用时：8899.29s`，这显然不是一个能够轻易接受的时间

因此，我们必须考虑优化

## 状态压缩

实际上，每一种可能，如（色泽=青绿)$∧$(根蒂=蜷缩)$∧$(敲声=清脆）可以看成一个点，不妨对点进行标号并状态压缩为 0(x) 00(y) 00(z) 形式
- x, y, z 分别代表色泽（取值 0, 1），根蒂（取值 0, 1, 2），敲声（取值 0, 1, 2）
- 所有点的集合就是 $\{0, 1, ...,  26(16+8+2)\}$
- 每一个合取式对应一个点集

同时，对于合取式对应的点集又可以状态压缩：注意到点集中最大编号也只有 26，因此一个点集可以通过移位合并成一个整数，我们最后只要统计有多少个不同的整数（并集）就可以了

## 剪枝

有些合取式（包含通配符）包含了另外一些合取式，因此如果选取了这种合取式，它的子合取式就没必要再选取了

这可以通过状态压缩后的位运算来实现，如果合取式 $a$ 包含了合取式 $b$，有 `a | b = a`，因为 b 不会贡献新的假设

## Python 代码

Python 标准库就对多处理（并行计算）有了比较好的支持，因此这里采用并行计算加速

```python
from itertools import product, repeat
from functools import reduce
from multiprocessing import Pool

def task(sets: list[int], n: int):
    """
    从给定的可选点集列表 sets 中选出 n 个进行取并，返回值是一个集合，包含所有可能得到的点集
    这里的点集都是指点集状态压缩后对应的整数
    """
    if len(sets) == n:
        return (reduce(int.__or__, sets),)

    chosen = sets[-1]
    if (n := (n - 1)) == 0:
        return (chosen,)

    sets = [s for s in sets if s | chosen != chosen]
    res = set()
    for _ in range(len(sets) - n + 1):
        res = res.union(ans | chosen for ans in task(sets, n))
        sets.pop()
    return res

def main(k: int, sets: list[int]):
    """
    对于给定的 k，拆分任务，多线程执行
    """
    all_ans = set()
    # 遍历所有可能的 n <= k，让 n 个点集组合
    for n in range(1, k + 1):
        p = Pool(15)
        paras = zip((sets[:i] for i in range(len(sets), n - 1, -1)), repeat(n))
        values = p.starmap(task, paras)
        p.close(); p.join()

        all_ans = set.union(all_ans, *values)
        print(f'k = {n} finished... Ans is {len(all_ans)}')

if __name__ == '__main__':
    # 初始化，先建立所有合取式的列表
    # 如开头所述，每个合取式被位压缩成整数
    state = lambda x, y, z: (x << 4) + (y << 2) + z
    sets = []
    for x, y, z in product(range(3), range(4), range(4)):
        if x == 2:
            sets.append(sets[state(0, y, z)] | sets[state(1, y, z)])
        elif y == 3:
            sets.append(sets[state(x, 0, z)] | sets[state(x, 1, z)] | sets[state(x, 2, z)])
        elif z == 3:
            sets.append(sets[state(x, y, 0)] | sets[state(x, y, 1)] | sets[state(x, y, 2)])
        else:
            sets.append(1 << state(x, y, z))
    # 添加空集
    sets = [0] + sets

    # 接受输入
    num = int(input())
    main(num, sets)
```

10 秒左右就可以输出结果，~~比知乎上的答案快了 900 倍~~

## C++ 代码

C++ 代码虽然没有并行，但本身编译型语言的性能就比较好，在我的设备上大约比上述 15 线程并行的 Python 代码快了一倍

```cpp
#include <iostream>
#include <unordered_set>
#include <vector>

using Set = std::unordered_set<int>;
using Vec = std::vector<int>;

Set task(Vec& sets, int n) {
    Set ans;

    if (sets.size() == n) {
        int or_acc = 0;
        for (auto const& set : sets) {
            or_acc |= set;
        }
        return ans.emplace(or_acc), ans;
    }

    int chosen = sets.back();
    if (!--n)
        return ans.emplace(chosen), ans;

    // shadowing sets, _sets is a new vec with only useful point sets
    Vec _sets;
    for (auto const& set : sets) {
        if ((set | chosen) != chosen) {
            _sets.push_back(set);
        }
    }

    Set rets;
    for (int i = _sets.size(); i >= n; i--) {
        rets = task(_sets, n);
        for (auto const& ret : rets) {
            ans.emplace(ret | chosen);
        }
        _sets.pop_back();
    }

    return ans;
}

int main() {
    Vec sets;
    Set ans;
    auto state = [](int x, int y, int z) { return (x << 4) + (y << 2) + z; };
    for (int x = 0; x < 3; x++) {
        for (int y = 0; y < 4; y++) {
            for (int z = 0; z < 4; z++) {
                if (x == 2) {
                    sets.push_back(sets[state(0, y, z)] | sets[state(1, y, z)]);
                } else if (y == 3) {
                    sets.push_back(sets[state(x, 0, z)] | sets[state(x, 1, z)] |
                                   sets[state(x, 2, z)]);
                } else if (z == 3) {
                    sets.push_back(sets[state(x, y, 0)] | sets[state(x, y, 1)] |
                                   sets[state(x, y, 2)]);
                } else {
                    sets.push_back(1 << state(x, y, z));
                }
            }
        }
    }
    sets.push_back(0);

    int k;
    std::cin >> k;

    Set rets;
    for (int n = 0; n <= k; n++) {
        rets = task(sets, n + 1);
        for (auto& ret : rets) {
            ans.insert(ret);
        }
        if (n) {
            std::cout << "length: " << n << " nums: " << ans.size()
                      << std::endl;
        }
    }
}
```