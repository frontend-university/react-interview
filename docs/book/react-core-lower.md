---
title: React 核心下
order: 3
---

### 1. What is a switching component?

A _switching component_ is a component that renders one of many components. We need to use object to map prop values to components.

For example, a switching component to display different pages based on `page` prop:

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

// The keys of the PAGES object can be used in the prop types to catch dev-time errors.
Page.propTypes = {
  page: PropTypes.oneOf(Object.keys(PAGES)).isRequired,
};
```

**[⬆ Back to Top](#table-of-contents)**

### 2. Why we need to pass a function to setState()?

The reason behind for this is that `setState()` is an asynchronous operation. React batches state changes for performance reasons, so the state may not change immediately after `setState()` is called. That means you should not rely on the current state when calling `setState()` since you can't be sure what that state will be. The solution is to pass a function to `setState()`, with the previous state as an argument. By doing this you can avoid issues with the user getting the old state value on access due to the asynchronous nature of `setState()`.

Let's say the initial count value is zero. After three consecutive increment operations, the value is going to be incremented only by one.

```javascript
// assuming this.state.count === 0
this.setState({ count: this.state.count + 1 });
this.setState({ count: this.state.count + 1 });
this.setState({ count: this.state.count + 1 });
// this.state.count === 1, not 3
```

If we pass a function to `setState()`, the count gets incremented correctly.

```javascript
this.setState((prevState, props) => ({
  count: prevState.count + props.increment,
}));
// this.state.count === 3 as expected
```

### 3. Why function is preferred over object for `setState()`?

React may batch multiple `setState()` calls into a single update for performance. Because `this.props` and `this.state` may be updated asynchronously, you should not rely on their values for calculating the next state.

This counter example will fail to update as expected:

```javascript
// Wrong
this.setState({
  counter: this.state.counter + this.props.increment,
});
```

The preferred approach is to call `setState()` with function rather than object. That function will receive the previous state as the first argument, and the props at the time the update is applied as the second argument.

```javascript
// Correct
this.setState((prevState, props) => ({
  counter: prevState.counter + props.increment,
}));
```

### 4. What is strict mode in React?

`React.StrictMode` is a useful component for highlighting potential problems in an application. Just like `<Fragment>`, `<StrictMode>` does not render any extra DOM elements. It activates additional checks and warnings for its descendants. These checks apply for _development mode_ only.

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

In the example above, the _strict mode_ checks apply to `<ComponentOne>` and `<ComponentTwo>` components only.

### 5. Why is `isMounted()` an anti-pattern and what is the proper solution?

The primary use case for `isMounted()` is to avoid calling `setState()` after a component has been unmounted, because it will emit a warning.

```javascript
if (this.isMounted()) {
  this.setState({...})
}
```

Checking `isMounted()` before calling `setState()` does eliminate the warning, but it also defeats the purpose of the warning. Using `isMounted()` is a code smell because the only reason you would check is because you think you might be holding a reference after the component has unmounted.

An optimal solution would be to find places where `setState()` might be called after a component has unmounted, and fix them. Such situations most commonly occur due to callbacks, when a component is waiting for some data and gets unmounted before the data arrives. Ideally, any callbacks should be canceled in `componentWillUnmount()`, prior to unmounting.

### 6. What are the Pointer Events supported in React?

_Pointer Events_ provide a unified way of handling all input events. In the old days we had a mouse and respective event listeners to handle them but nowadays we have many devices which don't correlate to having a mouse, like phones with touch surface or pens. We need to remember that these events will only work in browsers that support the _Pointer Events_ specification.

The following event types are now available in _React DOM_:

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

### 7. Why should component names start with capital letter?

If you are rendering your component using JSX, the name of that component has to begin with a capital letter otherwise React will throw an error as unrecognized tag. This convention is because only HTML elements and SVG tags can begin with a lowercase letter.

```jsx | pure
class SomeComponent extends Component {
  // Code goes here
}
```

You can define component class which name starts with lowercase letter, but when it's imported it should have capital letter. Here lowercase is fine:

```jsx | pure
class myComponent extends Component {
  render() {
    return <div />;
  }
}

export default myComponent;
```

While when imported in another file it should start with capital letter:

```jsx | pure
import MyComponent from './MyComponent';
```

#### What are the exceptions on React component naming?

The component names should start with a uppercase letter but there are few exceptions on this convention. The lowercase tag names with a dot (property accessors) are still considered as valid component names.

For example the below tag can be compiled to a valid component,

```jsx | pure
render(){
return (
    <obj.component /> // `React.createElement(obj.component)`
   )
}
```

### 8. Are custom DOM attributes supported in React v16?

Yes. In the past, React used to ignore unknown DOM attributes. If you wrote JSX with an attribute that React doesn't recognize, React would just skip it.

For example, let's take a look at the below attribute:

```jsx | pure
<div mycustomattribute={'something'} />
```

Would render an empty div to the DOM with React v15:

```html
<div />
```

In React v16 any unknown attributes will end up in the DOM:

```html
<div mycustomattribute="something" />
```

This is useful for supplying browser-specific non-standard attributes, trying new DOM APIs, and integrating with opinionated third-party libraries.

### 9. What is the difference between constructor and getInitialState?

You should initialize state in the constructor when using ES6 classes, and `getInitialState()` method when using `React.createClass()`.

**Using ES6 classes:**

```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      /* initial state */
    };
  }
}
```

**Using `React.createClass()`:**

```javascript
const MyComponent = React.createClass({
  getInitialState() {
    return {
      /* initial state */
    };
  },
});
```

**Note:** `React.createClass()` is deprecated and removed in React v16. Use plain JavaScript classes instead.

### 10. Can you force a component to re-render without calling setState?

By default, when your component's state or props change, your component will re-render. If your `render()` method depends on some other data, you can tell React that the component needs re-rendering by calling `forceUpdate()`.

```javascript
component.forceUpdate(callback);
```

It is recommended to avoid all uses of `forceUpdate()` and only read from `this.props` and `this.state` in `render()`.

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
