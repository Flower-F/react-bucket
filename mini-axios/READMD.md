# mini-axios

拦截器的思想就是维护一个**栈**。

初始状态：

![](https://cdn.jsdelivr.net/gh/Flower-F/picture@main/img/b6f359d27917f407aeee28d8de0fcc89.png)

添加请求拦截器，因为是在请求之前，所以要 `unshift()`：

![](https://cdn.jsdelivr.net/gh/Flower-F/picture@main/img/96a882dc8d8d5177e9ec68a3a2773aec.png)

响应拦截器：显然这时候应该 `push()`：

![](https://cdn.jsdelivr.net/gh/Flower-F/picture@main/img/1316baf932c226e334ed6e61852c5c29.png)

然后遍历整个栈结构，每次出栈都是**一对**出栈， 因为 promise 的 then 就是一个成功，一个失败。

```js
promise = promise.then(chain.shift(), chain.shift());
```

遍历栈结束后，返回经过所有处理的 promise，然后就可以拿到最终的值了。


