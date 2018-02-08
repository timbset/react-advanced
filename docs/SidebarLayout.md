# SidebarLayout

## Advantages

* Default behavior is closed to material guidelines
* No rerendering of content and sidebars on any actions
* React for rendering only. All manipulations using pure JS for high performance
* Swipeable on touch devices
* Up to 4 DOM elements
* Easy to customize

## Examples

[Example with Material UI](https://codesandbox.io/s/pjm5omv4zq) and [Pure Example](https://codesandbox.io/s/8l5l8zxwr8)

## API

* `Leftbar`: `Component` - a leftbar content
* `Rightbar`: `Component` - a rightbar content
* `children`: `node` - a main content
* `children`: `function({ onLeftbarToggle: func, onRightbarToggle: func }) => node` - a main content
  * `onLeftbarToggle`: `function(value: ?bool) => void` - toggles leftbar open state
  * `onRightbarToggle`: `function(value: ?bool) => void` - toggles rightbar open state
      * `value`: `bool` - an open state. If not set, toggles open state

Note that leftbar and rightbar width depends on them content width
