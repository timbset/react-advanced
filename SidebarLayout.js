import React from 'react';

const sidebarStyle = {
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  background: 'white',
  zIndex: 1000,
  boxShadow: '0px 8px 10px -5px rgba(0, 0, 0, 0.2), 0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12)',
  height: '100%',
  overflowY: 'auto',
  transform: 'translate(-100%)',
  transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
  willChange: 'transform'
};

const backLayerStyle = {
  position: 'fixed',
  height: '100%',
  width: '100%',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  opacity: 0,
  pointerEvents: 'none',
  willChange: 'opacity',
  zIndex: 500
};

class SidebarLayout extends React.PureComponent {
  constructor(props) {
    super(props);

    this._isOpened = false;
    this._toggle = this._toggle.bind(this);
  }

  _toggle(value = !this._isOpened) {
    const { sidebar, backLayer } = this.refs;

    sidebar.style.transform = value
      ? 'translate(0)'
      : 'translate(-100%)';

    backLayer.style.opacity = value
      ? 1
      : 0;

    backLayer.style['pointer-events'] = value
      ? ''
      : 'none';

    this._isOpened = value;
  }

  render() {
    const { children, Leftbar } = this.props;

    return (
      <div>
        <div ref="sidebar" style={sidebarStyle}>
          <Leftbar toggleLeftbar={this._toggle} />
        </div>
        {typeof children === 'function'
          ? children({
            toggleLeftbar: this._toggle
          })
          : children}
        <div ref="backLayer" style={backLayerStyle} onClick={() => this._toggle()} />
      </div>
    );
  }
}

export default SidebarLayout;

