---
title: React 核心下
order: 3
---

### 1. 什么是切换组件？

切换组件是一个渲染许多组件中的一个组件。我们需要使用对象来将 props 值映射到组件。

例如，一个切换组件可以根据 `page` props 显示不同的页面。

```jsx | pure
import HomePage from './HomePage';
import AboutPage from './AboutPage';
import ServicesPage from './ServicesPage';
import ContactPage from './ContactPage';

const PAGES = {
  home: HomePage,
  about: AboutPage,
  services: ServicesPage,
  contact: ContactPage,
};

const Page = props => {
  const Handler = PAGES[props.page] || ContactPage;

  return <Handler {...props} />;
};

// PAGES 对象的键可以在 props 类型中使用，以捕捉开发时间错误。
Page.propTypes = {
  page: PropTypes.oneOf(Object.keys(PAGES)).isRequired,
};
```

### 2. 为什么我们需要向 `setState()` 传递一个函数？

这背后的原因是，`setState()` 是一个异步操作。出于性能的考虑，React 会对状态变化进行批处理，所以在调用 `setState()` 后，状态可能不会立即发生变化。这意味着你在调用 `setState()` 时不应该依赖当前的状态，因为你不能确定这个状态会是什么。解决办法是将一个函数传递给 `setState()`，并将之前的状态作为参数。通过这样做，你可以避免由于 `setState()` 的异步性而导致用户在访问时获得旧的状态值的问题。

假设初始计数值为 0。在连续三次递增操作后，该值将只递增一个。

```javascript
// 假设 this.state.count === 0
this.setState({ count: this.state.count + 1 });
this.setState({ count: this.state.count + 1 });
this.setState({ count: this.state.count + 1 });
// this.state.count === 1，而不是 3
```

如果我们给 `setState()` 传递一个函数，计数就会被正确地递增。

```javascript
this.setState((prevState, props) => ({
  count: prevState.count + props.increment,
}));
// this.state.count === 3
```

### 3. 为什么在 `setState()` 中首选函数而不是对象？

React 可以将多个 `setState()` 的调用批量化为一次更新，以提高性能。因为 `this.props` 和 `this.state` 可能被异步更新，你不应该依赖它们的值来计算下一个状态。

这个计数器的例子将无法按预期更新。

```javascript
// 错误❌
this.setState({
  counter: this.state.counter + this.props.increment,
});
```

首选的方法是用函数而不是对象调用 `setState()`。该函数将接收先前的状态作为第一个参数，并将应用更新时的 props 作为第二个参数。

```javascript
// 正确✅
this.setState((prevState, props) => ({
  counter: prevState.counter + props.increment,
}));
```

### 4. React 中的严格模式是什么？

`React.StrictMode` 是一个有用的组件，用于暴露应用程序中的潜在问题。就像 `<Fragment>`，`<StrictMode>`不会渲染任何额外的 DOM 元素。它为其后代激活了额外的检查和警告。这些检查只适用于开发模式。

```jsx | pure
import React from 'react';

function ExampleApplication() {
  return (
    <div>
      <Header />
      <React.StrictMode>
        <div>
          <ComponentOne />
          <ComponentTwo />
        </div>
      </React.StrictMode>
      <Footer />
    </div>
  );
}
```

在上面的例子中，严格模式检查只适用于 `<ComponentOne>` 和 `<ComponentTwo>` 组件。

### 5. 为什么 `isMounted()` 是一个反模式，正确的解决方案是什么？

`isMounted()` 的主要用例是避免在组件被卸载后调用 `setState()`，因为它会发出警告。

```javascript
if (this.isMounted()) {
  this.setState({...})
}
```

在调用 `setState()` 之前检查 `isMounted()` 确实可以消除警告，但这也违背了警告的目的。使用 `isMounted()` 是一种代码异味，因为你检查的唯一原因是你认为你可能在组件卸载后还持有一个引用。

一个最佳的解决方案是找到在组件卸载后可能调用 `setState()` 的地方，并修复它们。这种情况通常是由于回调引起的，当一个组件在等待一些数据时，在数据到达之前被卸载。理想情况下，任何回调都应该在 `componentWillUnmount()` 中取消（在解除挂载之前）。

> 代码异味 (Code smell)：程序开发领域，代码中的任何可能导致深层次问题的症状都可以叫做代码异味。 通常，在对代码做简短的反馈迭代时，代码异味会暴露出一些深层次的问题，这里的反馈迭代，是指以一种小范围的、可控的方式重构代码。

### 6. React 中支持哪些指针事件？

指针事件提供了一个处理所有输入事件的统一方法。在过去，我们有一个鼠标和各自的事件监听器来处理它们，但现在我们有许多设备与拥有鼠标不相关，如带有触摸表面的手机或笔。我们需要记住，这些事件只能在支持 Pointer Events 规范的浏览器中工作。

以下事件类型现在在 React DOM 中可用。

1. `onPointerDown`
2. `onPointerMove`
3. `onPointerUp`
4. `onPointerCancel`
5. `onGotPointerCapture`
6. `onLostPointerCapture`
7. `onPointerEnter`
8. `onPointerLeave`
9. `onPointerOver`
10. `onPointerOut`

### 7. 为什么组件名称要以大写字母开头？

如果你使用 JSX 渲染你的组件，该组件的名称必须以大写字母开头，否则 React 将抛出一个错误，即未识别的标签。这个惯例是因为只有 HTML 元素和 SVG 标签可以以小写字母开头。

```jsx | pure
class SomeComponent extends Component {
  // 掘金不止，代码不停
}
```

你可以定义名称以小写字母开头的组件类，但当它被导入时，它应该是大写字母。在这里，小写就可以了。

```jsx | pure
class myComponent extends Component {
  render() {
    return <div />;
  }
}

export default myComponent;
```

而当导入另一个文件时，它应该以大写字母开始。

```jsx | pure
import MyComponent from './MyComponent';
```

#### 关于 React 组件的命名，有哪些例外情况？

组件名称应以大写字母开头，但这一惯例也有少数例外。带点的小写标签名（属性访问器）仍被认为是有效的组件名。

例如，下面的标签可以被编译成一个有效的组件。

```jsx | pure
render(){
return (
    <obj.component /> // `React.createElement(obj.component)`
   )
}
```

### 8. React v16 中支持自定义 DOM 属性吗？

是的，在过去，React 习惯于忽略未知的 DOM 属性。如果你写的 JSX 有一个 React 不认识的属性，React 会直接跳过它。

例如，让我们看一下下面的属性。

```jsx | pure
<div mycustomattribute={'something'} />
```

用 React v15 渲染一个空的 div 到 DOM 上。

```html
<div />
```
在 React v16 中，任何未知的属性最终都会出现在 DOM 中。

```html
<div mycustomattribute="something" />
```

这对于提供浏览器特定的非标准属性，尝试新的 DOM API，以及与有主见的第三方库集成是非常有用的。

### 9. constructor 和 getInitialState 的区别是什么？

当使用 ES6 类时，你应该在构造函数中初始化状态，而当使用 `React.createClass()` 时，应该在 `getInitialState()` 方法中初始化状态。

**使用 ES6 类：**

```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      /* 初始化状态 */
    };
  }
}
```

**使用 `React.createClass()`：**

```javascript
const MyComponent = React.createClass({
  getInitialState() {
    return {
      /* 初始化状态 */
    };
  },
});
```

**注意：** `React.createClass()` 在 React v16 中已被废弃并删除。请使用普通的 JavaScript 类来代替。

### 10. 你能在不调用 setState 的情况下强制一个组件重新渲染吗？

默认情况下，当你的组件的状态或 props 改变时，你的组件会重新渲染。如果你的 `render()` 方法依赖于其他数据，你可以通过调用 `forceUpdate()` 告诉 React 该组件需要重新渲染。

```javascript
component.forceUpdate(callback);
```

建议避免使用 `forceUpdate()`，只在 `render()` 中读取`this.props` 和 `this.state`。

### 11. 在  React 中使用 ES6 类的，`super()` 和 `super(props)` 之间有什么区别？

当你想在 `constructor()` 中访问 `this.props` 时，你应该把 props 传给 `super()` 方法。

**使用 `super(props)`：**

```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props); // { name: 'John', ... }
  }
}
```

**使用 `super()`：**

```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super();
    console.log(this.props); // undefined
  }
}
```

在 `constructor()` 之外，两者都会显示相同的 `this.props` 的值。

### 12. 如何在 JSX 内循环？

你可以简单地使用 `Array.prototype.map` 与 ES6 箭头函数语法。

例如，对象的 `items` 数组被映射成组件的数组。

```jsx | pure
<tbody>
  {items.map(item => (
    <SomeComponent key={item.id} name={item.name} />
  ))}
</tbody>
```

但你不能用 `for` 循环来迭代。

```jsx | pure
<tbody>
for (let i = 0; i < items.length; i++) {
  <SomeComponent key={items[i].id} name={items[i].name} />
}
</tbody>
```

这是因为 JSX 标签被转换为函数调用，而且你不能在表达式中使用语句。这可能会改变，因为 `do` 表达式是第一阶段的建议。

### 13. 你如何在属性引号中访问 props？

React（或 JSX）不支持属性值内的变量插值。下面的表示方法就不能用了。

```jsx | pure
<img className="image" src="images/{this.props.image}" />
```

但你可以把任何 JS 表达式放在大括号内作为整个属性值。所以下面的表达式是有效的。

```jsx | pure
<img className="image" src={'images/' + this.props.image} />
```

使用模板字符串也可以。

```jsx | pure
<img className="image" src={`images/${this.props.image}`} />
```

### 14. 什么是带 shape 的 React 原型数组？

如果你想把一个对象数组传递给一个具有特定 shape 的组件，那么使用 `React.PropTypes.shape()` 作为 `React.PropTypes.arrayOf()` 的一个参数。

```javascript
ReactComponent.propTypes = {
  arrayWithShape: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      color: React.PropTypes.string.isRequired,
      fontSize: React.PropTypes.number.isRequired,
    }),
  ).isRequired,
};
```

### 15. 如何有条件地应用类属性？

你不应该在引号内使用大括号，因为它将被计算为一个字符串。

```jsx | pure
<div className="btn-panel {this.props.visible ? 'show' : 'hidden'}">
```

相反，你需要把大括号移到外面（别忘了在类名之间包括空格）。

```jsx | pure
<div className={'btn-panel ' + (this.props.visible ? 'show' : 'hidden')}>
```

模板字符串也可以使用。

```jsx | pure
<div className={`btn-panel ${this.props.visible ? 'show' : 'hidden'}`}>
```

### 16. React 和 ReactDOM 之间有什么区别？

`react` 包包含 `React.createElement()`、`React.Component`、`React.Children`, 以及其他与元素和组件类相关的帮助函数。你可以把这些看作是你构建组件所需要的同构或通用助手。`react-dom` 包包含 `ReactDOM.render()`，在 `react-dom/server` 中，我们有 `ReactDOMServer.renderToString()` 和 `ReactDOMServer.renderToStaticMarkup()` 的服务器端渲染支持。

### 17. 为什么 ReactDOM 要从 React 中分离出来？

React 团队致力于将所有与 DOM 相关的功能提取到一个单独的库中，称为 ReactDOM。React v0.14 是第一个分割库的版本。通过查看一些包，`react-native`、`react-art`、`react-canvas`和 `react-three`，已经很清楚，React 的优秀和本质与浏览器或 DOM 无关。

为了建立更多 React 可以渲染的环境，React 团队计划将主 React 包分成两个：`react` 和 `react-dom`。这就为编写可以在网络版 React 和 React Native 之间共享的组件铺平了道路。

### 18. 如何使用 React label 元素？

如果你试图用标准的 `for` 属性渲染一个绑定在文本输入上的 `<label>` 元素，那么它产生的 HTML 会缺少该属性，并在控制台打印出警告。

```jsx | pure
<label for={'user'}>{'User'}</label>
<input type={'text'} id={'user'} />
```

由于 `for` 在 JavaScript 中是一个保留关键字，我们可以使用 `htmlFor` 代替。

```jsx | pure
<label htmlFor={'user'}>{'User'}</label>
<input type={'text'} id={'user'} />
```

### 19. 如何组合多个内联样式对象？

你可以在常规 React 中使用展开语法。

```jsx | pure
<button style={{ ...styles.panel.button, ...styles.panel.submitButton }}>
  {'Submit'}
</button>
```

如果你使用的是 React Native，那么你可以使用数组符号。

```jsx | pure
<button style={[styles.panel.button, styles.panel.submitButton]}>
  {'Submit'}
</button>
```

### 20. 如何在浏览器调整大小时重新渲染视图？

你可以在 `componentDidMount()` 中监听 `resize` 事件，然后更新尺寸（`width` 和 `height`）。你应该在 `componentWillUnmount()` 方法中移除监听器。

```jsx | pure
class WindowDimensions extends React.Component {

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  updateDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    return (
      <span>
        {this.state.width} x {this.state.height}
      </span>
    );
  }
}
```

### 21. `setState()` 和 `replaceState()` 方法之间的区别是什么？

当你使用 `setState()` 时，当前和之前的状态被合并。 `replaceState()` 抛出当前的状态，只用你提供的内容来替换它。通常 `setState()` 会被使用，除非你真的因为某些原因需要删除所有之前的键。你也可以在 `setState()` 中把状态设置为 `false`/`null`，而不是使用 `replaceState()`。

### 22. 如何监听状态变化？

当状态发生变化时，`componentDidUpdate` 生命周期方法将被调用。你可以将提供的状态和 props 值与当前的状态和 props 进行比较，以确定是否有意义的变化。

```
componentDidUpdate(object prevProps, object prevState)
```

**注意：** 以前的 ReactJS 版本也使用 `componentWillUpdate(object nextProps, object nextState)` 监听状态改变。在最新的版本中，它已被弃用。

### 23. 在 React 状态下，删除数组元素的推荐方法是什么？

更好的方法是使用 `Array.prototype.filter()` 方法。

例如，让我们创建一个 `removeItem()` 方法来更新状态。

```javascript
removeItem(index) {
  this.setState({
    data: this.state.data.filter((item, i) => i !== index)
  })
}
```

### 24. 有没有可能在不渲染 HTML 的情况下使用 React 呢？

在最新版本（>=16.2）中可以实现。以下是可用选项。

```jsx | pure
render() {
  return false
}
```

```jsx | pure
render() {
  return null
}
```

```jsx | pure
render() {
  return []
}
```

```jsx | pure
render() {
  return <React.Fragment></React.Fragment>
}
```

```jsx | pure
render() {
  return <></>
}
```

返回 `undefined` 是不行的。

### 25. 如何用 React 打印漂亮的 JSON？

我们可以使用 `<pre>` 标签，这样可以保留 `JSON.stringify()` 的格式。

```jsx | pure
const data = { name: 'John', age: 42 };

class User extends React.Component {
  render() {
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
  }
}

React.render(<User />, document.getElementById('container'));
```

### 26. 为什么你不能在 React 中更新 props？

React 的理念是，props 应该是**不可变的**和**自上而下**的。这意味着父组件可以向子组件发送任何 props 值，但子组件不能修改收到的 props。

### 27. 如何在页面加载时聚焦一个输入框？

你可以通过为 `input` 元素创建 ref 并在 `componentDidMount()` 中使用它。

```jsx | pure
class App extends React.Component {
  componentDidMount() {
    if (this.nameInput) {
      this.nameInput.focus();
    }
  }

  render() {
    return (
      <div>
        <input defaultValue={"Won't focus"} />
        <input
          ref={input => (this.nameInput = input)}
          defaultValue={'Will focus'}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
```

### 28. 更新状态中的对象的方式有哪些？

1. **合并状态和对象后调用 `setState()`：**

- 使用 `Object.assign()` 创建对象的拷贝：

```javascript
const user = Object.assign({}, this.state.user, { age: 42 });
this.setState({ user });
```

- 使用展开操作符：

```javascript
const user = { ...this.state.user, age: 42 };
this.setState({ user });
```

2. **调用 `setState()` 时传入函数：**

```javascript
this.setState(prevState => ({
  user: {
    ...prevState.user,
    age: 42,
  },
}));
```

### 29. 我们如何在浏览器中查看运行时的 React 的版本？

你可以使用 `React.version` 来获取版本。

```jsx | pure
const REACT_VERSION = React.version;

ReactDOM.render(
  <div>{`React version: ${REACT_VERSION}`}</div>,
  document.getElementById('app'),
);
```

### 30. 在 `create-react-app` 中包含 polyfills 的方法是什么？

有一些方法可以在 create-react-app 中包含 polyfills。

1. **手动从 `core-js` 引入：**

创建一个名为（类似）`polyfills.js` 的文件并将其导入根 `index.js` 文件。运行 `npm install core-js` 或 `yarn add core-js` 并导入你所需要的特定功能。

```javascript
import 'core-js/fn/array/find';
import 'core-js/fn/array/includes';
import 'core-js/fn/number/is-nan';
```

2. **使用 Polyfill 服务：**

使用 polyfill.io CDN，通过在 `index.html` 中添加这一行来检索自定义的、针对浏览器的 polyfills。

```html
<script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=default,Array.prototype.includes"></script>
```

在上面的脚本中，我们必须明确请求 `Array.prototype.includes` 功能，因为它不包括在默认功能集中。

### 31. How to use https instead of http in create-react-app?

You just need to use `HTTPS=true` configuration. You can edit your `package.json` scripts section:

```json
"scripts": {
 "start": "set HTTPS=true && react-scripts start"
}
```

or just run `set HTTPS=true && npm start`

### 32. How to avoid using relative path imports in create-react-app?

Create a file called `.env` in the project root and write the import path:

```
NODE_PATH=src/app
```

After that restart the development server. Now you should be able to import anything inside `src/app` without relative paths.

### 33. How to add Google Analytics for React Router?

Add a listener on the `history` object to record each page view:

```javascript
history.listen(function(location) {
  window.ga('set', 'page', location.pathname + location.search);
  window.ga('send', 'pageview', location.pathname + location.search);
});
```

### 34. How to update a component every second?

You need to use `setInterval()` to trigger the change, but you also need to clear the timer when the component unmounts to prevent errors and memory leaks.

```javascript
componentDidMount() {
  this.interval = setInterval(() => this.setState({ time: Date.now() }), 1000)
}

componentWillUnmount() {
  clearInterval(this.interval)
}
```

### 35. How do you apply vendor prefixes to inline styles in React?

React _does not_ apply _vendor prefixes_ automatically. You need to add vendor prefixes manually.

```jsx | pure
<div
  style={{
    transform: 'rotate(90deg)',
    WebkitTransform: 'rotate(90deg)', // note the capital 'W' here
    msTransform: 'rotate(90deg)', // 'ms' is the only lowercase vendor prefix
  }}
/>
```

### 36. How to import and export components using React and ES6?

You should use default for exporting the components

```jsx | pure
import React from 'react';
import User from 'user';

export default class MyProfile extends React.Component {
  render() {
    return <User type="customer">//...</User>;
  }
}
```

With the export specifier, the MyProfile is going to be the member and exported to this module and the same can be imported without mentioning the name in other components.

### 37. Why is a component constructor called only once?

React's _reconciliation_ algorithm assumes that without any information to the contrary, if a custom component appears in the same place on subsequent renders, it's the same component as before, so reuses the previous instance rather than creating a new one.

### 38. How to define constants in React?

You can use ES7 `static` field to define constant.

```javascript
class MyComponent extends React.Component {
  static DEFAULT_PAGINATION = 10;
}
```

_Static fields_ are part of the _Class Fields_ stage 3 proposal.

### 39. How to programmatically trigger click event in React?

You could use the ref prop to acquire a reference to the underlying `HTMLInputElement` object through a callback, store the reference as a class property, then use that reference to later trigger a click from your event handlers using the `HTMLElement.click` method.

This can be done in two steps:

1. Create ref in render method:

```jsx | pure
<input ref={input => (this.inputElement = input)} />
```

2. Apply click event in your event handler:

```javascript
this.inputElement.click();
```

### 40. Is it possible to use async/await in plain React?

If you want to use `async`/`await` in React, you will need _Babel_ and [transform-async-to-generator](https://babeljs.io/docs/en/babel-plugin-transform-async-to-generator) plugin. React Native ships with Babel and a set of transforms.

### 41. What are the common folder structures for React?

There are two common practices for React project file structure.

1. **Grouping by features or routes:**

One common way to structure projects is locate CSS, JS, and tests together, grouped by feature or route.

```
common/
├─ Avatar.js
├─ Avatar.css
├─ APIUtils.js
└─ APIUtils.test.js
feed/
├─ index.js
├─ Feed.js
├─ Feed.css
├─ FeedStory.js
├─ FeedStory.test.js
└─ FeedAPI.js
profile/
├─ index.js
├─ Profile.js
├─ ProfileHeader.js
├─ ProfileHeader.css
└─ ProfileAPI.js
```

2. **Grouping by file type:**

Another popular way to structure projects is to group similar files together.

```
api/
├─ APIUtils.js
├─ APIUtils.test.js
├─ ProfileAPI.js
└─ UserAPI.js
components/
├─ Avatar.js
├─ Avatar.css
├─ Feed.js
├─ Feed.css
├─ FeedStory.js
├─ FeedStory.test.js
├─ Profile.js
├─ ProfileHeader.js
└─ ProfileHeader.css
```

### 42. What are the popular packages for animation?

_React Transition Group_ and _React Motion_ are popular animation packages in React ecosystem.

### 43. What is the benefit of styles modules?

It is recommended to avoid hard coding style values in components. Any values that are likely to be used across different UI components should be extracted into their own modules.

For example, these styles could be extracted into a separate component:

```javascript
export const colors = {
  white,
  black,
  blue,
};

export const space = [0, 8, 16, 32, 64];
```

And then imported individually in other components:

```javascript
import { space, colors } from './styles';
```

### 44. What are the popular React-specific linters?

ESLint is a popular JavaScript linter. There are plugins available that analyse specific code styles. One of the most common for React is an npm package called `eslint-plugin-react`. By default, it will check a number of best practices, with rules checking things from keys in iterators to a complete set of prop types.

Another popular plugin is `eslint-plugin-jsx-a11y`, which will help fix common issues with accessibility. As JSX offers slightly different syntax to regular HTML, issues with `alt` text and `tabindex`, for example, will not be picked up by regular plugins.

### 45. How to make AJAX call and in which component lifecycle methods should I make an AJAX call?

You can use AJAX libraries such as Axios, jQuery AJAX, and the browser built-in `fetch`. You should fetch data in the `componentDidMount()` lifecycle method. This is so you can use `setState()` to update your component when the data is retrieved.

For example, the employees list fetched from API and set local state:

```jsx | pure
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      employees: [],
      error: null,
    };
  }

  componentDidMount() {
    fetch('https://api.example.com/items')
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            employees: result.employees,
          });
        },
        error => {
          this.setState({ error });
        },
      );
  }

  render() {
    const { error, employees } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else {
      return (
        <ul>
          {employees.map(employee => (
            <li key={employee.name}>
              {employee.name}-{employee.experience}
            </li>
          ))}
        </ul>
      );
    }
  }
}
```

### 46. What are render props?

**Render Props** is a simple technique for sharing code between components using a prop whose value is a function. The below component uses render prop which returns a React element.

```jsx | pure
<DataProvider render={data => <h1>{`Hello ${data.target}`}</h1>} />
```

Libraries such as React Router and DownShift are using this pattern.
