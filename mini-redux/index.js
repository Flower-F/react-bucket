function createStore(reducer) {
  let state; // state 记录所有状态
  const listeners = []; // 保存所有注册的回调

  function subscribe(callback) {
    listeners.push(callback); // subscribe 就是将回调保存下来
  }

  // dispatch 就是将所有的回调拿出来依次执行
  // reducer 的作用是在发布事件的时候改变 state
  function dispatch(action) {
    state = reducer(state, action);

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }

  // 获取 state
  function getState() {
    return state;
  }

  const store = {
    subscribe,
    dispatch,
    getState,
  };

  return store;
}

module.exports = {
  createStore,
};
