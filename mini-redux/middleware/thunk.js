// 如果 action 是个函数，就调用这个函数
// 如果 action 不是函数，就传给下一个中间件

function thunk({ dispatch, getState }) {
  return (next) => (action) => {
    if (typeof action === 'function') {
      action(dispatch, getState);
    }

    next(action);
  };
}
