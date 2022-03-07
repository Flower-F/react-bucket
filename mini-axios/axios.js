const InterceptorManager = require('./interceptor');

class Axios {
  constructor(config) {
    this.defaults = config;
    this.interceptors = {
      // 请求拦截器和响应拦截器
      request: new InterceptorManager(),
      response: new InterceptorManager(),
    };
  }

  // 发送一个请求
  request(config) {
    // 这里呢其实就是去处理了 axios(url, [,config])
    if (typeof config === 'string') {
      config = arguments[1] || {};
      config.url = arguments[0];
    } else {
      config = config || {};
    }

    // 默认 get 请求，并且都转成小写
    if (config.method) {
      config.method = config.method.toLowerCase();
    } else {
      config.method = 'get';
    }

    // dispatchRequest 就是发送 ajax 请求
    const chain = [dispatchRequest, undefined];
    //  发生请求之前加入拦截的 fulfilled 和 reject 函数
    this.interceptors.request.forEach((item) => {
      chain.unshift(item.fulfilled, item.rejected);
    });
    // 在请求之后增加 fulfilled 和 reject 函数
    this.interceptors.response.forEach((item) => {
      chain.push(item.fulfilled, item.rejected);
    });

    // 利用 promise 的链式调用，将参数一层一层传下去
    let promise = Promise.resolve(config);

    //遍历 chain
    while (chain.length) {
      // 这里不断出栈 直到结束为止
      promise = promise.then(chain.shift(), chain.shift());
    }
    return promise;
  }
}
