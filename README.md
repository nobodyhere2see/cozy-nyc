
# cozy.nyc

[![Build Status](https://travis-ci.org/cozy-nyc/cozy.nyc.svg?branch=master&style=flat-square)](https://travis-ci.org/cozy-nyc/cozy.nyc)
[![Dependency Status](https://david-dm.org/cozy-nyc/cozy.nyc.svg?style=flat-square)](https://david-dm.org/cozy-nyc/cozy.nyc)
[![devDependency Status](https://david-dm.org/cozy-nyc/cozy.nyc/dev-status.svg?style=flat-square)](https://david-dm.org/cozy-nyc/cozy.nyc?type=dev)

---

## Installation

```bash
npm install
```

## Running Dev Server

```bash
npm run dev
```

The first time it may take a little while to generate the first `webpack-assets.json` and complain with a few dozen `[webpack-isomorphic-tools] (waiting for the first Webpack build to finish)` printouts, but be patient. Give it 30 seconds.

### Using Redux DevTools

[Redux Devtools](https://github.com/gaearon/redux-devtools) are enabled by default in development.

- <kbd>CTRL</kbd>+<kbd>H</kbd> Toggle DevTools Dock
- <kbd>CTRL</kbd>+<kbd>Q</kbd> Move DevTools Dock Position
- see [redux-devtools-dock-monitor](https://github.com/gaearon/redux-devtools-dock-monitor) for more detailed information.

If you have the [Redux DevTools chrome extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) installed it will automatically be used on the client-side instead.

If you want to disable the dev tools during development, set `__DEVTOOLS__` to `false` in `/webpack/dev.config.js`.  
DevTools are not enabled during production by default.

## Building and Running Production Server

```bash
npm run build
npm run start
```

## Demo

A demonstration of this app can be seen [running on heroku](https://react-hot-example.herokuapp.com/), which is a deployment of the [heroku branch](https://github.com/bertho-zero/react-redux-universal-hot-example/tree/heroku).

## Explanation

What initially gets run is `bin/server.js`, which does little more than enable ES6 and ES7 awesomeness in the server-side node code. It then initiates `server.js`. In `server.js` we proxy any requests to `/api/*` to the API server, running at `localhost:3030`. All the data fetching calls from the client go to `/api/*`. Aside from serving the favicon and static content from `/static`, the only thing `server.js` does is initiate delegate rendering to `react-router`. At the bottom of `server.js`, we listen to port `3000` and initiate the API server.

#### Routing and HTML return

The primary section of `server.js` generates an HTML page with the contents returned by `react-router`. First we instantiate an `ApiClient`, a facade that both server and client code use to talk to the API server. On the server side, `ApiClient` is given the request object so that it can pass along the session cookie to the API server to maintain session state. We pass this API client facade to the `redux` middleware so that the action creators have access to it.
You can also use `app` for RESTful calls to api.

Then we perform [server-side data fetching](#server-side-data-fetching), wait for the data to be loaded, and render the page with the now-fully-loaded `redux` state.

The last interesting bit of the main routing section of `server.js` is that we swap in the hashed script and css from the `webpack-assets.json` that the Webpack Dev Server – or the Webpack build process on production – has spit out on its last run. You won't have to deal with `webpack-assets.json` manually because [webpack-isomorphic-tools](https://github.com/halt-hammerzeit/webpack-isomorphic-tools) take care of that.

We also spit out the `redux` state into a global `window.__data` variable in the webpage to be loaded by the client-side `redux` code.

#### Server-side Data Fetching

The [redial](https://www.npmjs.com/package/redial) package exposes an API to return promises that need to be fulfilled before a route is rendered. It exposes a `<ReduxAsyncConnect />` container, which wraps our render tree on both [server](https://github.com/bertho-zero/react-redux-universal-hot-example/blob/master/src/server.js) and [client](https://github.com/bertho-zero/react-redux-universal-hot-example/blob/master/src/client.js). More documentation is available on the [redial](https://www.npmjs.com/package/redial) page.

#### Client Side

The client side entry point is reasonably named `client.js`. All it does is load the routes, initiate `react-router`, rehydrate the redux state from the `window.__data` passed in from the server, and render the page over top of the server-rendered DOM. This makes React enable all its event listeners without having to re-render the DOM.

#### Redux Middleware

The middleware, [`clientMiddleware.js`](https://github.com/bertho-zero/react-redux-universal-hot-example/blob/master/src/redux/middleware/clientMiddleware.js), serves two functions:

1. To allow the action creators access to the client API facade. Remember this is the same on both the client and the server, and cannot simply be `import`ed because it holds the cookie needed to maintain session on server-to-server requests.
2. To allow some actions to pass a "promise generator", a function that takes the API client and returns a promise. Such actions require three action types, the `REQUEST` action that initiates the data loading, and a `SUCCESS` and `FAILURE` action that will be fired depending on the result of the promise. There are other ways to accomplish this, some discussed [here](https://github.com/reactjs/redux/issues/99), which you may prefer, but to the author of this example, the middleware way feels cleanest.

#### Redux Modules... *What the Duck*?

The `src/redux/modules` folder contains "modules" to help
isolate concerns within a Redux application (aka [Ducks](https://github.com/erikras/ducks-modular-redux), a Redux Style Proposal that I came up with). I encourage you to read the
[Ducks Docs](https://github.com/erikras/ducks-modular-redux) and provide feedback.

#### Getting data and actions into components

To understand how the data and action bindings get into the components – there's only one, `InfoBar`, in this example – I'm going to refer to you to the [Redux](https://github.com/gaearon/redux) library. The only innovation I've made is to package the component and its wrapper in the same js file. This is to encapsulate the fact that the component is bound to the `redux` actions and state. The component using `InfoBar` needn't know or care if `InfoBar` uses the `redux` data or not.

#### Images

Now it's possible to render the image both on client and server. Please refer to issue [#39](https://githubThis project uses [local styles](https://medium.com/seek-ui-engineering/the-end-of-global-css-90d2a4a06284) using [css-loader](https://github.com/webpack/css-loader). The way it works is that you import your stylesheet at the top of the `render()` function in your React Component, and then you use the classnames returned from that import. Like so:

```javascript
render() {
const styles = require('./App.scss');
...
```

Then you set the `className` of your element to match one of the CSS classes in your SCSS file, and you're good to go!

```jsx
<div className={styles.mySection}> ... </div>
```

#### Alternative to Local Styles

If you'd like to use plain inline styles this is possible with a few modifications to your webpack configuration.

**1. Configure Isomorphic Tools to Accept CSS**

In `webpack-isomorphic-tools.js` add **css** to the list of style module extensions

```javascript
    style_modules: {
      extensions: ['less','scss','css'],
```

**2. Add a CSS loader to webpack dev config**

In `dev.config.js` modify **module loaders** to include a test and loader for css

```javascript
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader'},
```

**3. Add a CSS loader to the webpack prod config**

You must use the **ExtractTextPlugin** in this loader. In `prod.config.js` modify **module loaders** to include a test and loader for css

```javascript
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader')},
```

**Now you may simply omit assigning the `required` stylesheet to a variable and keep it at the top of your `render()` function.**

```javascript
render() {
require('./App.css');
require('aModule/dist/style.css');
...
```

**NOTE** In order to use this method with **scss or less** files one more modification must be made. In both `dev.config.js` and `prod.config.js` in the loaders for less and scss files remove

1. `modules`
2. `localIdentName...`

Before:
```javascript
{ test: /\.less$/, loader: 'style!css?modules&importLoaders=2&sourceMap&localIdentName=[local]___[hash:base64:5]!autoprefixer?browsers=last 2 version!less?outputStyle=expanded&sourceMap' },
```
After:
```javascript
{ test: /\.less$/, loader: 'style!css?importLoaders=2&sourceMap!autoprefixer?browsers=last 2 version!less?outputStyle=expanded&sourceMap' },
```

After this modification to both loaders you will be able to use scss and less files in the same way as css files..com/erikras/react-redux-universal-hot-example/issues/39) for more detail discussion, the usage would be like below (super easy):

```javascript
let logoImage = require('./logo.png');
```

#### Styles

This project uses [local styles](https://medium.com/seek-ui-engineering/the-end-of-global-css-90d2a4a06284) using [css-loader](https://github.com/webpack/css-loader). The way it works is that you import your stylesheet at the top of the `render()` function in your React Component, and then you use the classnames returned from that import. Like so:

```javascript
render() {
const styles = require('./App.scss');
...
```

Then you set the `className` of your element to match one of the CSS classes in your SCSS file, and you're good to go!

```jsx
<div className={styles.mySection}> ... </div>
```

#### Alternative to Local Styles

If you'd like to use plain inline styles this is possible with a few modifications to your webpack configuration.

**1. Configure Isomorphic Tools to Accept CSS**

In `webpack-isomorphic-tools.js` add **css** to the list of style module extensions

```javascript
    style_modules: {
      extensions: ['less','scss','css'],
```

**2. Add a CSS loader to webpack dev config**

In `dev.config.js` modify **module loaders** to include a test and loader for css

```javascript
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader'},
```

**3. Add a CSS loader to the webpack prod config**

You must use the **ExtractTextPlugin** in this loader. In `prod.config.js` modify **module loaders** to include a test and loader for css

```javascript
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader')},
```

**Now you may simply omit assigning the `required` stylesheet to a variable and keep it at the top of your `render()` function.**

```javascript
render() {
require('./App.css');
require('aModule/dist/style.css');
...
```

**NOTE** In order to use this method with **scss or less** files one more modification must be made. In both `dev.config.js` and `prod.config.js` in the loaders for less and scss files remove

1. `modules`
2. `localIdentName...`

Before:
```javascript
{ test: /\.less$/, loader: 'style!css?modules&importLoaders=2&sourceMap&localIdentName=[local]___[hash:base64:5]!autoprefixer?browsers=last 2 version!less?outputStyle=expanded&sourceMap' },
```
After:
```javascript
{ test: /\.less$/, loader: 'style!css?importLoaders=2&sourceMap!autoprefixer?browsers=last 2 version!less?outputStyle=expanded&sourceMap' },
```

After this modification to both loaders you will be able to use scss and less files in the same way as css files.

#### Unit Tests

The project uses [Jest](https://facebook.github.io/jest/) to run your unit tests.

To run the tests in the project, just simply run `npm test` if you have `Chrome` installed, it will be automatically launched as a test service for you.
