---
title: React 核心中
order: 2
---

### 1. 协调（reconciliation）是什么？

当一个组件的 props 或 state 发生变化时，React 通过比较新返回的元素和之前渲染的元素来决定是否有必要进行实际的 DOM 更新。当它们不相等时，React 将更新 DOM。这个过程被称为 _协调（reconciliation）_。

### 2. 如何用一个动态键名来设置状态？

如果你使用 ES6 或 Babel 转码器来转换你的 JSX 代码，那么你可以用计算属性命名完成。

```javascript
handleInputChange(event) {
  this.setState({ [event.target.id]: event.target.value })
}
```

### 3. 每次组件渲染时，函数被调用的常见错误是什么？

你需要确保在传递函数作为参数时，没有调用该函数。

```jsx | pure
render() {
  // 错误❌： handleClick 被调用而不是作为引用被传入
  return <button onClick={this.handleClick()}>{'Click Me'}</button>
}
```

取而代之的是传递函数本身，不加圆括号。

```jsx | pure
render() {
  // 正确：handleClick 是作为一个引用传递的!
  return <button onClick={this.handleClick}>{'Click Me'}</button>
}
```

### 4. lazy 函数是否支持命名导出？

不，目前 `React.lazy` 函数只支持默认出口。如果你想导入被命名导出的模块，你可以创建一个中间模块，将其作为默认出口。这也保证了摇树的工作，不会拉取未使用的组件。

让我们来看看一个导出多个命名组件的组件文件。

```javascript
// MoreComponents.js
export const SomeComponent = /* ... */;
export const UnusedComponent = /* ... */;
```

并在一个中间文件 `IntermediateComponent.js` 中重新导出 `MoreComponents.js` 组件

```javascript
// IntermediateComponent.js
export { SomeComponent as default } from './MoreComponents.js';
```

现在你可以使用下面的 lazy 函数导入该模块。

```javascript
import React, { lazy } from 'react';
const SomeComponent = lazy(() => import('./IntermediateComponent.js'));
```

### 5. 为什么 React 使用 `className` 而不是 `class` 属性？

`class` 是 JavaScript 的一个关键字，而 JSX 是 JavaScript 的一个扩展。这就是为什么 React 使用 `className` 而不是 `class` 的主要原因。传递一个字符串作为 `className` prop。

```jsx | pure
render() {
  return <span className={'menu navigation-menu'}>{'Menu'}</span>
}
```

### 6. 片段（fragments）是什么？

这是 React 中常见的模式，用于一个组件返回多个元素。片段让你可以对一个 children 的列表进行分组，而无需在 DOM 中添加额外的节点。

```jsx | pure
render() {
  return (
    <React.Fragment>
      <ChildA />
      <ChildB />
      <ChildC />
    </React.Fragment>
  )
}
```

这里还有一个短语法可以用，但是很多工具不支持：

```jsx | pure
render() {
  return (
    <>
      <ChildA />
      <ChildB />
      <ChildC />
    </>
  )
}
```

### 7. 为什么片段（fragments）比 div 容器要好？

1. 片段的速度更快一些，并且由于没有创建额外的 DOM 节点而使用更少的内存。这只有在非常大和深的树上才会体现出真正的好处。
2. 一些 CSS 机制，如 Flexbox 和 CSS Grid 有一个特殊的父子关系，在中间添加 div 会使其难以保持所需的布局。
3. DOM 检查器不那么杂乱。

### 8. 什么是 React 中的传递门（Portal）？

传递门是一种推荐的方式，可以将子节点渲染到父组件的 DOM 层次结构之外的 DOM 节点中。

```javascript
ReactDOM.createPortal(child, container);
```

第一个参数是任何可渲染的 React children，比如一个元素、字符串或片段。第二个参数是一个 DOM 元素。

### 9. 什么是无状态组件?

如果行为是独立于其状态的，那么它可以是一个无状态组件。你可以使用函数或类来创建无状态组件。但除非你需要在你的组件中使用生命周期钩子，否则你应该选择函数组件。如果你决定在这里使用函数组件，会有很多好处；它们易于编写、理解和测试，速度稍快，而且你可以完全避免使用 `this` 关键字。

### 10. 什么是状态组件?

如果一个组件的行为依赖于该组件的状态（state），那么它可以被称为有状态的组件。这些有状态的组件总是类组件，并且有一个在构造器（`constructor`）中被初始化的状态。

```javascript
class App extends Component {
  // 也可以使用类字段语法
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    // ...
  }
}
```

**React 16.8 更新：**

Hooks 让你在不写类的情况下使用状态和其他 React 功能。

等效的函数组件

```javascript
import React, {useState} from 'react';

const App = (props) => {
  const [count, setCount] = useState(0);

  return (
    // JSX
  )
}
```

### 11. 如何在 React 中对 props 进行验证？

当应用程序运行在开发模式时，React 会自动检查我们在组件上设置的所有 props，以确保它们具有正确的类型。如果类型不正确，React 会在控制台生成警告信息。由于对性能的影响，它在生产模式中被禁用。必需 props 是用 `isRequired` 定义的。

预定义的 props 类型集合。

1. `PropTypes.number`
2. `PropTypes.string`
3. `PropTypes.array`
4. `PropTypes.object`
5. `PropTypes.func`
6. `PropTypes.node`
7. `PropTypes.element`
8. `PropTypes.bool`
9. `PropTypes.symbol`
10. `PropTypes.any`

我们可以为 `User` 组件定义 `propTypes`，如下所示。

```jsx | pure
import React from 'react';
import PropTypes from 'prop-types';

class User extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
  };

  render() {
    return (
      <>
        <h1>{`Welcome, ${this.props.name}`}</h1>
        <h2>{`Age, ${this.props.age}`}</h2>
      </>
    );
  }
}
```

> 注意：在 React v15.5 中，`PropTypes` 被从 `React.PropTypes` 移到 `prop-types`库中。

等效的函数式组件：

```jsx | pure
import React from 'react';
import PropTypes from 'prop-types';

function User() {
  return (
    <>
      <h1>{`Welcome, ${this.props.name}`}</h1>
      <h2>{`Age, ${this.props.age}`}</h2>
    </>
  );
}

User.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
};
```

### 12. React 的优势是什么？

以下是 React的 主要优势。

1. 通过虚拟 DOM 提高应用程序的性能。
2. JSX 使代码易于阅读和编写。
3. 它在客户端和服务器端都能进行渲染（SSR）。
4. 易于与框架（Angular, Backbone）集成，因为它只是一个视图库。
5. 使用 Jest 等工具容易编写单元和集成测试。

### 13. React 的局限性是什么？

除了优点之外，React 也有一些限制。

1. React 只是一个视图库，不是一个完整的框架。
2. 对于刚接触网络开发的初学者来说，有一个学习曲线。
3. 将 React 整合到传统的 MVC 框架中需要一些额外的配置。
4. 代码的复杂性随着内联模板和 JSX 的增加而增加。
5. 太多的小组件导致了过度工程化或模板化。

### 14. 什么是 React v16 中的错误边界（Error Boundary）？

错误边界是指在其子组件树的任何地方捕获 JavaScript 错误的组件，记录这些错误，并显示一个后备 UI ，而不是崩溃的组件树。

如果一个类组件定义了一个新的生命周期方法 `componentDidCatch(error, info)` 或 `static getDerivedStateFromError()` ，它就成为一个错误边界。

```jsx | pure
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // 你也可以把错误记录到一个错误报告服务中去
    logErrorToMyService(error, info)。
  }

  static getDerivedStateFromError(error) {
    // 更新状态，以便下次渲染时显示回退的用户界面。
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // 你可以渲染任何自定义的回退用户界面
      return <h1>{'Something went wrong.'}</h1>;
    }
    return this.props.children。
  }
}
```

之后把它作为一个普通的组件使用。

```jsx | pure
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

### 15. React v15 中是如何处理错误边界的？

React v15 使用 `unstable_handleError` 方法为错误边界提供了非常基本的支持。在 React v16 中，它已经被重新命名为 `componentDidCatch`。

### 16. 静态类型检查的推荐方式是什么？

通常我们使用 PropTypes 库（`React.PropTypes` 从 React v15.5 开始转移到 `prop-types` 包）来进行 React 应用中的类型检查。对于大型代码库，建议使用静态类型检查器，如 Flow 或 TypeScript，在编译时进行类型检查并提供自动补全功能。

### 17. `react-dom` 包有什么用？

`react-dom` 包提供了 DOM 特定的方法，可以在你的应用程序的顶层使用。大多数组件不需要使用此模块。这个包的一些方法是：

1. `render()`
2. `hydrate()`
3. `unmountComponentAtNode()`
4. `findDOMNode()`
5. `createPortal()`

### 18. `react-dom` 的 render 方法的目的是什么？

此方法用于将 React 元素渲染到提供的容器中的 DOM 中，并返回对组件的引用。如果 React 元素之前已渲染到容器中，它将对其执行更新，并且仅在必要时更改 DOM 以反映最新更改。

```jsx | pure
ReactDOM.render(element, container[, callback])
```

如果提供了可选的回调，它将在组件渲染或更新后执行。

### 19. 什么是 ReactDOMServer？

`ReactDOMServer` 对象使你能够将组件呈现为静态标记（通常用于节点服务器）。该对象主要用于服务器端渲染（SSR）。以下方法可用于服务器和浏览器环境：

1. `renderToString()`
2. `renderToStaticMarkup()`

例如，你通常运行基于 Node 的 Web 服务器（如 Express、Hapi 或 Koa），然后调用 `renderToString` 将根组件渲染为字符串，然后将其作为响应发送。

```javascript
// 使用 Express
import { renderToString } from 'react-dom/server';
import MyPage from './MyPage';

app.get('/', (req, res) => {
  res.write('<!DOCTYPE html><html><head><title>My Page</title></head><body>');
  res.write('<div id="content">');
  res.write(renderToString(<MyPage />));
  res.write('</div></body></html>');
  res.end();
});
```

### 20. 如何在 React 中使用 innerHTML？

`dangerouslySetInnerHTML` 属性是 React 在浏览器 DOM 中使用 `innerHTML` 的替代品。就像 `innerHTML` 一样，考虑到跨站点脚本 (XSS) 攻击，使用此属性是有风险的。你只需要传递一个 `__html` 对象作为键和 HTML 文本作为值。

在这个例子中，MyComponent 使用 `dangerouslySetInnerHTML` 属性来设置 HTML 标记：

```jsx | pure
function createMarkup() {
  return { __html: 'First &middot; Second' };
}

function MyComponent() {
  return <div dangerouslySetInnerHTML={createMarkup()} />;
}
```

### 21. How to use styles in React?

The `style` attribute accepts a JavaScript object with camelCased properties rather than a CSS string. This is consistent with the DOM style JavaScript property, is more efficient, and prevents XSS security holes.

```jsx | pure
const divStyle = {
  color: 'blue',
  backgroundImage: 'url(' + imgUrl + ')',
};

function HelloWorldComponent() {
  return <div style={divStyle}>Hello World!</div>;
}
```

Style keys are camelCased in order to be consistent with accessing the properties on DOM nodes in JavaScript (e.g. `node.style.backgroundImage`).

### 22. How events are different in React?

Handling events in React elements has some syntactic differences:

1. React event handlers are named using camelCase, rather than lowercase.
2. With JSX you pass a function as the event handler, rather than a string.

### 23. What will happen if you use `setState()` in constructor?

When you use `setState()`, then apart from assigning to the object state React also re-renders the component and all its children. You would get error like this: _Can only update a mounted or mounting component._ So we need to use `this.state` to initialize variables inside constructor.

### 24. What is the impact of indexes as keys?

Keys should be stable, predictable, and unique so that React can keep track of elements.

In the below code snippet each element's key will be based on ordering, rather than tied to the data that is being represented. This limits the optimizations that React can do.

```jsx | pure
{
  todos.map((todo, index) => <Todo {...todo} key={index} />);
}
```

If you use element data for unique key, assuming todo.id is unique to this list and stable, React would be able to reorder elements without needing to reevaluate them as much.

```jsx | pure
{
  todos.map(todo => <Todo {...todo} key={todo.id} />);
}
```

### 25. Is it good to use `setState()` in `componentWillMount()` method?

Yes, it is safe to use `setState()` inside `componentWillMount()` method. But at the same it is recommended to avoid async initialization in `componentWillMount()` lifecycle method. `componentWillMount()` is invoked immediately before mounting occurs. It is called before `render()`, therefore setting state in this method will not trigger a re-render. Avoid introducing any side-effects or subscriptions in this method. We need to make sure async calls for component initialization happened in `componentDidMount()` instead of `componentWillMount()`.

```jsx | pure
componentDidMount() {
  axios.get(`api/todos`).then((result) => {
    this.setState({
      messages: [...result.data]
    })
  })
}
```

### 26. What will happen if you use props in initial state?

If the props on the component are changed without the component being refreshed, the new prop value will never be displayed because the constructor function will never update the current state of the component. The initialization of state from props only runs when the component is first created.

The below component won't display the updated input value:

```jsx | pure
class MyComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      records: [],
      inputValue: this.props.inputValue,
    };
  }

  render() {
    return <div>{this.state.inputValue}</div>;
  }
}
```

Using props inside render method will update the value:

```jsx | pure
class MyComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      record: [],
    };
  }

  render() {
    return <div>{this.props.inputValue}</div>;
  }
}
```

### 27. How do you conditionally render components?

In some cases you want to render different components depending on some state. JSX does not render `false` or `undefined`, so you can use conditional _short-circuiting_ to render a given part of your component only if a certain condition is true.

```jsx | pure
const MyComponent = ({ name, address }) => (
  <div>
    <h2>{name}</h2>
    {address && <p>{address}</p>}
  </div>
);
```

If you need an `if-else` condition then use _ternary operator_.

```jsx | pure
const MyComponent = ({ name, address }) => (
  <div>
    <h2>{name}</h2>
    {address ? <p>{address}</p> : <p>{'Address is not available'}</p>}
  </div>
);
```

### 28. Why we need to be careful when spreading props on DOM elements?

When we _spread props_ we run into the risk of adding unknown HTML attributes, which is a bad practice. Instead we can use prop destructuring with `...rest` operator, so it will add only required props.

For example,

```jsx | pure
const ComponentA = () => (
  <ComponentB isDisplay={true} className={'componentStyle'} />
);

const ComponentB = ({ isDisplay, ...domProps }) => (
  <div {...domProps}>{'ComponentB'}</div>
);
```

### 29. How you use decorators in React?

You can _decorate_ your _class_ components, which is the same as passing the component into a function. **Decorators** are flexible and readable way of modifying component functionality.

```jsx | pure
@setTitle('Profile')
class Profile extends React.Component {
  //....
}

/*
title is a string that will be set as a document title
WrappedComponent is what our decorator will receive when
put directly above a component class as seen in the example above
*/
const setTitle = title => WrappedComponent => {
  return class extends React.Component {
    componentDidMount() {
      document.title = title;
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};
```

**Note:** Decorators are a feature that didn't make it into ES7, but are currently a _stage 2 proposal_.

### 30. How do you memoize a component?

There are memoize libraries available which can be used on function components.

For example `moize` library can memoize the component in another component.

```jsx | pure
import moize from 'moize';
import Component from './components/Component'; // this module exports a non-memoized component

const MemoizedFoo = moize.react(Component);

const Consumer = () => {
  <div>
    {'I will memoize the following entry:'}
    <MemoizedFoo />
  </div>;
};
```

**Update:** Since React v16.6.0, we have a `React.memo`. It provides a higher order component which memoizes component unless the props change. To use it, simply wrap the component using React.memo before you use it.

```js
const MemoComponent = React.memo(function MemoComponent(props) {
  /* render using props */
});
// OR
export default React.memo(MyFunctionComponent);
```

### 31. How you implement Server Side Rendering or SSR?

React is already equipped to handle rendering on Node servers. A special version of the DOM renderer is available, which follows the same pattern as on the client side.

```jsx | pure
import ReactDOMServer from 'react-dom/server';
import App from './App';

ReactDOMServer.renderToString(<App />);
```

This method will output the regular HTML as a string, which can be then placed inside a page body as part of the server response. On the client side, React detects the pre-rendered content and seamlessly picks up where it left off.

### 32. How to enable production mode in React?

You should use Webpack's `DefinePlugin` method to set `NODE_ENV` to `production`, by which it strip out things like propType validation and extra warnings. Apart from this, if you minify the code, for example, Uglify's dead-code elimination to strip out development only code and comments, it will drastically reduce the size of your bundle.

### 33. What is CRA and its benefits?

The `create-react-app` CLI tool allows you to quickly create & run React applications with no configuration step.

Let's create Todo App using _CRA_:

```console
# Installation
$ npm install -g create-react-app

# Create new project
$ create-react-app todo-app
$ cd todo-app

# Build, test and run
$ npm run build
$ npm run test
$ npm start
```

It includes everything we need to build a React app:

1. React, JSX, ES6, and Flow syntax support.
2. Language extras beyond ES6 like the object spread operator.
3. Autoprefixed CSS, so you don’t need -webkit- or other prefixes.
4. A fast interactive unit test runner with built-in support for coverage reporting.
5. A live development server that warns about common mistakes.
6. A build script to bundle JS, CSS, and images for production, with hashes and sourcemaps.

### 34. What is the lifecycle methods order in mounting?

The lifecycle methods are called in the following order when an instance of a component is being created and inserted into the DOM.

1. `constructor()`
2. `static getDerivedStateFromProps()`
3. `render()`
4. `componentDidMount()`

### 35. What are the lifecycle methods going to be deprecated in React v16?

The following lifecycle methods going to be unsafe coding practices and will be more problematic with async rendering.

1. `componentWillMount()`
2. `componentWillReceiveProps()`
3. `componentWillUpdate()`

Starting with React v16.3 these methods are aliased with `UNSAFE_` prefix, and the unprefixed version will be removed in React v17.

### 36. What is the purpose of `getDerivedStateFromProps()` lifecycle method?

The new static `getDerivedStateFromProps()` lifecycle method is invoked after a component is instantiated as well as before it is re-rendered. It can return an object to update state, or `null` to indicate that the new props do not require any state updates.

```javascript
class MyComponent extends React.Component {
  static getDerivedStateFromProps(props, state) {
    // ...
  }
}
```

This lifecycle method along with `componentDidUpdate()` covers all the use cases of `componentWillReceiveProps()`.

### 37. What is the purpose of `getSnapshotBeforeUpdate()` lifecycle method?

The new `getSnapshotBeforeUpdate()` lifecycle method is called right before DOM updates. The return value from this method will be passed as the third parameter to `componentDidUpdate()`.

```javascript
class MyComponent extends React.Component {
  getSnapshotBeforeUpdate(prevProps, prevState) {
    // ...
  }
}
```

This lifecycle method along with `componentDidUpdate()` covers all the use cases of `componentWillUpdate()`.

### 38. Do Hooks replace render props and higher order components?

Both render props and higher-order components render only a single child but in most of the cases Hooks are a simpler way to serve this by reducing nesting in your tree.

### 39. What is the recommended way for naming components?

It is recommended to name the component by reference instead of using `displayName`.

Using `displayName` for naming component:

```javascript
export default React.createClass({
  displayName: 'TodoApp',
  // ...
});
```

The **recommended** approach:

```javascript
export default class TodoApp extends React.Component {
  // ...
}
```

### 40. What is the recommended ordering of methods in component class?

_Recommended_ ordering of methods from _mounting_ to _render stage_:

1. `static` methods
2. `constructor()`
3. `getChildContext()`
4. `componentWillMount()`
5. `componentDidMount()`
6. `componentWillReceiveProps()`
7. `shouldComponentUpdate()`
8. `componentWillUpdate()`
9. `componentDidUpdate()`
10. `componentWillUnmount()`
11. click handlers or event handlers like `onClickSubmit()` or `onChangeDescription()`
12. getter methods for render like `getSelectReason()` or `getFooterContent()`
13. optional render methods like `renderNavigation()` or `renderProfilePicture()`
14. `render()`
