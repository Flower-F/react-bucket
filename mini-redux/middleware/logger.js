function logger({ _, getState }) {
  return (next) => (action) => {
    console.log(`action type: ${action.type}`);
    console.log(`prev state: ${getState()}`);
    console.log(action);
    next(action);
    console.log(`next state: ${getState()}`);
  };
}
