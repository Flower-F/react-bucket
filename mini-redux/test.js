const { createStore } = require('./index');

const initState = {
  count: 0,
};

function reducer(state = initState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + action.count };
    case 'DECREMENT':
      return { ...state, count: state.count - action.count };
    default:
      return state;
  }
}

const store = createStore(reducer);

// 订阅 store
store.subscribe(() => console.log(store.getState()));

store.dispatch({ type: 'INCREMENT', count: 1 });
store.dispatch({ type: 'INCREMENT', count: 1 });
store.dispatch({ type: 'DECREMENT', count: 2 });
