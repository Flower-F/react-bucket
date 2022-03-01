# mini-react

## mini-react 与 react 的区别：

- 在 render 阶段遍历了整颗 Fiber 树，在源码中如果节点什么都没改变会命中优化的逻辑，然后跳过这个节点的遍历
![](https://cdn.jsdelivr.net/gh/Flower-F/picture@main/img/20220301154956.png)
- commit 遍历了整颗 Fiber 树，源码中只遍历 effectList
- 每次遍历的时候都是新建节点，源码中某些条件会复用节点
- 没有用到优先级
