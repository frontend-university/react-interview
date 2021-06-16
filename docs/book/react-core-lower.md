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

### 11. What is the difference between `super()` and `super(props)` in React using ES6 classes?

When you want to access `this.props` in `constructor()` then you should pass props to `super()` method.

**Using `super(props)`:**

```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props); // { name: 'John', ... }
  }
}
```

**Using `super()`:**

```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super();
    console.log(this.props); // undefined
  }
}
```

Outside `constructor()` both will display same value for `this.props`.

### 12. How to loop inside JSX?

You can simply use `Array.prototype.map` with ES6 _arrow function_ syntax.

For example, the `items` array of objects is mapped into an array of components:

```jsx | pure
<tbody>
  {items.map(item => (
    <SomeComponent key={item.id} name={item.name} />
  ))}
</tbody>
```

But you can't iterate using `for` loop:

```jsx | pure
<tbody>
for (let i = 0; i < items.length; i++) {
  <SomeComponent key={items[i].id} name={items[i].name} />
}
</tbody>
```

This is because JSX tags are transpiled into _function calls_, and you can't use statements inside expressions. This may change thanks to `do` expressions which are _stage 1 proposal_.

### 13. How do you access props in attribute quotes?

React (or JSX) doesn't support variable interpolation inside an attribute value. The below representation won't work:

```jsx | pure
<img className="image" src="images/{this.props.image}" />
```

But you can put any JS expression inside curly braces as the entire attribute value. So the below expression works:

```jsx | pure
<img className="image" src={'images/' + this.props.image} />
```

Using _template strings_ will also work:

```jsx | pure
<img className="image" src={`images/${this.props.image}`} />
```

### 14. What is React proptype array with shape?

If you want to pass an array of objects to a component with a particular shape then use `React.PropTypes.shape()` as an argument to `React.PropTypes.arrayOf()`.

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

### 15. How to conditionally apply class attributes?

You shouldn't use curly braces inside quotes because it is going to be evaluated as a string.

```jsx | pure
<div className="btn-panel {this.props.visible ? 'show' : 'hidden'}">
```

Instead you need to move curly braces outside (don't forget to include spaces between class names):

```jsx | pure
<div className={'btn-panel ' + (this.props.visible ? 'show' : 'hidden')}>
```

_Template strings_ will also work:

```jsx | pure
<div className={`btn-panel ${this.props.visible ? 'show' : 'hidden'}`}>
```

### 16. What is the difference between React and ReactDOM?

The `react` package contains `React.createElement()`, `React.Component`, `React.Children`, and other helpers related to elements and component classes. You can think of these as the isomorphic or universal helpers that you need to build components. The `react-dom` package contains `ReactDOM.render()`, and in `react-dom/server` we have _server-side rendering_ support with `ReactDOMServer.renderToString()` and `ReactDOMServer.renderToStaticMarkup()`.

### 17. Why ReactDOM is separated from React?

The React team worked on extracting all DOM-related features into a separate library called _ReactDOM_. React v0.14 is the first release in which the libraries are split. By looking at some of the packages, `react-native`, `react-art`, `react-canvas`, and `react-three`, it has become clear that the beauty and essence of React has nothing to do with browsers or the DOM.

To build more environments that React can render to, React team planned to split the main React package into two: `react` and `react-dom`. This paves the way to writing components that can be shared between the web version of React and React Native.

### 18. How to use React label element?

If you try to render a `<label>` element bound to a text input using the standard `for` attribute, then it produces HTML missing that attribute and prints a warning to the console.

```jsx | pure
<label for={'user'}>{'User'}</label>
<input type={'text'} id={'user'} />
```

Since `for` is a reserved keyword in JavaScript, use `htmlFor` instead.

```jsx | pure
<label htmlFor={'user'}>{'User'}</label>
<input type={'text'} id={'user'} />
```

### 19. How to combine multiple inline style objects?

You can use _spread operator_ in regular React:

```jsx | pure
<button style={{ ...styles.panel.button, ...styles.panel.submitButton }}>
  {'Submit'}
</button>
```

If you're using React Native then you can use the array notation:

```jsx | pure
<button style={[styles.panel.button, styles.panel.submitButton]}>
  {'Submit'}
</button>
```

### 20. How to re-render the view when the browser is resized?

You can listen to the `resize` event in `componentDidMount()` and then update the dimensions (`width` and `height`). You should remove the listener in `componentWillUnmount()` method.

```javascript
class WindowDimensions extends React.Component {
  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  updateDimensions() {
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

### 21. What is the difference between `setState()` and `replaceState()` methods?

When you use `setState()` the current and previous states are merged. `replaceState()` throws out the current state, and replaces it with only what you provide. Usually `setState()` is used unless you really need to remove all previous keys for some reason. You can also set state to `false`/`null` in `setState()` instead of using `replaceState()`.

### 22. How to listen to state changes?

The `componentDidUpdate` lifecycle method will be called when state changes. You can compare provided state and props values with current state and props to determine if something meaningful changed.

```
componentDidUpdate(object prevProps, object prevState)
```

**Note:** The previous releases of ReactJS also uses `componentWillUpdate(object nextProps, object nextState)` for state changes. It has been deprecated in latest releases.

### 23. What is the recommended approach of removing an array element in React state?

The better approach is to use `Array.prototype.filter()` method.

For example, let's create a `removeItem()` method for updating the state.

```javascript
removeItem(index) {
  this.setState({
    data: this.state.data.filter((item, i) => i !== index)
  })
}
```

### 24. Is it possible to use React without rendering HTML?

It is possible with latest version (>=16.2). Below are the possible options:

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

Returning `undefined` won't work.

### 25. How to pretty print JSON with React?

We can use `<pre>` tag so that the formatting of the `JSON.stringify()` is retained:

```jsx | pure
const data = { name: 'John', age: 42 };

class User extends React.Component {
  render() {
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
  }
}

React.render(<User />, document.getElementById('container'));
```

### 26. Why you can't update props in React?

The React philosophy is that props should be _immutable_ and _top-down_. This means that a parent can send any prop values to a child, but the child can't modify received props.

### 27. How to focus an input element on page load?

You can do it by creating _ref_ for `input` element and using it in `componentDidMount()`:

```jsx | pure
class App extends React.Component {
  componentDidMount() {
    this.nameInput.focus();
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

### 28. What are the possible ways of updating objects in state?

1. **Calling `setState()` with an object to merge with state:**

- Using `Object.assign()` to create a copy of the object:

```javascript
const user = Object.assign({}, this.state.user, { age: 42 });
this.setState({ user });
```

- Using _spread operator_:

```javascript
const user = { ...this.state.user, age: 42 };
this.setState({ user });
```

2. **Calling `setState()` with a function:**

```javascript
this.setState(prevState => ({
  user: {
    ...prevState.user,
    age: 42,
  },
}));
```

### 29. How can we find the version of React at runtime in the browser?

You can use `React.version` to get the version.

```jsx | pure
const REACT_VERSION = React.version;

ReactDOM.render(
  <div>{`React version: ${REACT_VERSION}`}</div>,
  document.getElementById('app'),
);
```

### 30. What are the approaches to include polyfills in your `create-react-app`?

There are approaches to include polyfills in create-react-app,

1. **Manual import from `core-js`:**

Create a file called (something like) `polyfills.js` and import it into root `index.js` file. Run `npm install core-js` or `yarn add core-js` and import your specific required features.

```javascript
import 'core-js/fn/array/find';
import 'core-js/fn/array/includes';
import 'core-js/fn/number/is-nan';
```

2. **Using Polyfill service:**

Use the polyfill.io CDN to retrieve custom, browser-specific polyfills by adding this line to `index.html`:

```html
<script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=default,Array.prototype.includes"></script>
```

In the above script we had to explicitly request the `Array.prototype.includes` feature as it is not included in the default feature set.

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
