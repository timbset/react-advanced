import React from 'react';

const sidebarStyle = {
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  background: 'white',
  zIndex: 1000,
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
  transition: 'opacity 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
  zIndex: 500,
  overflowX: 'hidden'
};

class SidebarLayout extends React.PureComponent {
  constructor(props) {
    super(props);

    this._isOpened = false;
    this._isDragConfirmed = false;
    this._identifier = null;
    this._toggle = this._toggle.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._onTouchCancel = this._onTouchCancel.bind(this);
  }

  componentDidMount() {
    window.addEventListener('touchstart', this._onTouchStart);
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    window.addEventListener('touchend', this._onTouchEnd);
    window.addEventListener('touchcancel', this._onTouchCancel);
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

  _onTouchStart(e) {
    if (this._identifier !== null) {
      return;
    }

    const touch = e.targetTouches[0];

    if (!this._isOpened && touch.clientX > 16) {
      return;
    }

    this._identifier = touch.identifier;

    this._clientX = touch.clientX;
    this._clientY = touch.clientY;
  }

  _onTouchMove(e) {
    if (this._identifier === null) {
      return;
    }

    let touch;

    for (let i = 0, n = e.targetTouches.length; i < n; i++ ){
      const currentTouch = e.targetTouches[i];

      if (currentTouch.identifier === this._identifier) {
        touch = currentTouch;
        break;
      }
    }

    if (!touch) {
      return;
    }

    this._offsetX = touch.clientX - this._clientX;

    if (!this._isDragConfirmed) {
      const offsetX = Math.abs(this._offsetX);
      const offsetY = Math.abs(touch.clientY - this._clientY);

      if (offsetY > offsetX) {
        this._onTouchCancel(e);
        return;
      }

      this._isDragConfirmed = true;
    }

    e.preventDefault();

    this._clientX = touch.clientX;
    this._clientY = touch.clientY;

    const width = this.refs.sidebar.offsetWidth;
    const sidebarPosition = Math.max(Math.min(this._clientX - width, 0), -width);
    this.refs.sidebar.style.transform = `translate(${sidebarPosition}px)`;
    this.refs.backLayer.style.opacity = 1 + sidebarPosition / width;
    this.refs.backLayer.style['pointer-events'] = 'all';
  }

  _onTouchEnd() {
    if (this._identifier === null) {
      return;
    }

    const width = this.refs.sidebar.offsetWidth;

    let sidebarPosition;

    if (this._offsetX > 10) {
      sidebarPosition = 0;
    } else if (this._offsetX < -10) {
      sidebarPosition = -width;
    } else {
      sidebarPosition = this._clientX > width / 2
        ? 0
        : -width;
    }

    this.refs.sidebar.style.transform = `translate(${sidebarPosition}px)`;
    this.refs.backLayer.style.opacity = sidebarPosition === 0 ? 1 : 0;
    this.refs.backLayer.style['pointer-events'] = sidebarPosition === 0 ? 'all' : 'none';
    this._identifier = null;
    this._isDragConfirmed = false;
    this._isOpened = sidebarPosition === 0;
  }

  _onTouchCancel() {
    if (this._identifier === null) {
      return;
    }

    this._identifier = null;
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
