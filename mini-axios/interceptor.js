export class InterceptorManager {
  constructor() {
    // 存放所有拦截器的栈
    this.handlers = [];
  }

  use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled,
      rejected,
    });
    //返回 id 便于取消
    return this.handlers.length - 1;
  }

  // 取消一个拦截器
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  // 执行栈中所有的 handler
  forEach(fn) {
    this.handlers.forEach((item) => {
      // 这里是为了过滤已经被取消的拦截器，因为已经取消的拦截器被置 null
      if (item) {
        fn(item);
      }
    });
  }
}
