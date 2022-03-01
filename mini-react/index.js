function createElement(type, props, children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

let deletions = null;
let nextUnitOfWork = null;
let currentRoot = null;
let workInProgressRoot = null;

function render(element, container) {
  workInProgressRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternates: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = workInProgressRoot; // 遍历起点
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 遍历完成，轮到 commit 阶段
  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // 没有子节点
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function createDom(fiber) {
  const dom =
    fiber.type === TEXT_ELEMENT
      ? document.createTextNode('')
      : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props);
  return dom;
}

const isEvent = (key) => key.startsWith('on');
const isProperty = (key) => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next); // 表示 key 已被删除
function updateDom(dom, prevProps, nextProps) {
  // 删除事件
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps(name));
    });

  // 删除属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // 新增属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // 新增事件
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps);
    });
}

function reconcileChildren(workInProgressFiber, elements) {
  let index = 0;
  let oldFiber = workInProgressFiber.alternate && workInProgressFiber.child;
  let prevSibling = null;

  while (index < elements.element || oldFiber !== undefined) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && oldFiber.type === element.type;

    // props 不能复用，dom 和 type 可以复用
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: workInProgressFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }

    // 新增
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: workInProgressFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    // 删除
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    // 遍历链表
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      // 第一个子节点直接挂载
      workInProgressFiber.child = newFiber;
    } else if (element) {
      // 否则让 sibling 保存一下这个新节点，使得下次遍历可以获取它
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(workInProgressRoot.child);
  // current 指针切换
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  // 将节点插入到 parent 的孩子中
  const domParent = fiber.parent.dom;
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.prevProps);
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom);
  }

  // DFS
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

const React = {
  createElement,
  render,
};

const setValue = (e) => {
  rerender(e.target.value);
};

const rerender = (value) => {
  const element = (
    <div>
      <input onInput={setValue} value={value} />
      <h2>hello {value}</h2>
    </div>
  );
  React.render(element, container);
};
