<p align="center">
    <img width="200" src="docs/logo.jpg">
</p>

<h1 align="center">React Advanced</h1>

React Advanced is a library with high-performance, customizable and perfect React components. 
See the list of available [components](#Components)

## Principles

* High performance
* No dependencies. Small bundle size
* Semver. No breaking changes on the patch version
* Easy customization
* Zero bugs policy
* Easy start with default behavior

## Installation

```sh
yarn add react-advanced
```

or

```sh
npm install --save react-advanced
```

## Usage

```jsx harmony
import React from 'react';
import { render } from 'react-dom';
import SidebarLayout from 'react-advanced/SidebarLayout';

const Sidebar = (props) => (
  <div style={{ width: 300 }}>
    <button onClick={() => props.toggle(false)}>Close</button>
    Your Sidebar
  </div>
);

const App = () => (
  <SidebarLayout Leftbar={Sidebar} Rightbar={Sidebar}>
    {props => (
      <div style={{ textAlign: 'center' }}>
        <button style={{ float: 'left' }} onClick={() => props.toggleLeftbar()}>Open left</button>
        Your content
        <button style={{ float: 'right' }} onClick={() => props.toggleRightbar()}>Open right</button>
      </div>
    )}
  </SidebarLayout>
);

render(<App />, document.getElementById('root'));
```

## Components

* [SidebarLayout](docs/SidebarLayout.md) - A layout component with material sidebars

## Contribution

Write your ideas or feedback about library to [the issues](https://github.com/timbset/react-advanced/issues). 
Vote for features in which you are interested.
Contribution guide will be added soon. 
