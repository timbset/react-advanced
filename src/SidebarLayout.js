import React from 'react';

const sidebarStyle = {
  position: 'fixed',
  top: 0,
  bottom: 0,
  background: 'white',
  zIndex: 1000,
  height: '100%',
  overflowY: 'auto',
  transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
  willChange: 'transform'
};

const leftbarStyle = {
  ...sidebarStyle,
  left: 0,
  transform: 'translate(-100%)'
};

const rightbarStyle = {
  ...sidebarStyle,
  right: 0,
  transform: 'translate(100%)'
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
  opacity: '0',
  pointerEvents: 'none',
  willChange: 'opacity',
  transition: 'opacity 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
  zIndex: 500,
  overflowX: 'hidden'
};

class SidebarLayout extends React.PureComponent {
  constructor(props) {
    super(props);

    this._barCoef = null;
    this._isDragConfirmed = false;
    this._identifier = null;
    this._toggleLeftbar = this._toggleLeftbar.bind(this);
    this._toggleRightbar = this._toggleRightbar.bind(this);
    this._closeAll = this._closeAll.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._onTouchCancel = this._onTouchCancel.bind(this);

    this._childrenProps = {
      toggleLeftbar: this._toggleLeftbar,
      toggleRightbar: this._toggleRightbar
    };
  }

  componentDidMount() {
    window.addEventListener('touchstart', this._onTouchStart);
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    window.addEventListener('touchend', this._onTouchEnd);
    window.addEventListener('touchcancel', this._onTouchCancel);
  }

  _toggleLeftbar(value = (this._barCoef !== 1)) {
    const { leftbar, rightbar, backLayer } = this.refs;

    leftbar.style.transform = value
      ? 'translate(0)'
      : 'translate(-100%)';

    if (value && rightbar) {
      rightbar.style.transform = 'translate(100%)';
    }

    backLayer.style.opacity = value
      ? 1
      : 0;

    backLayer.style['pointer-events'] = value
      ? ''
      : 'none';

    this._barCoef = value ? 1 : null;
  }

  _toggleRightbar(value = (this._barCoef !== -1)) {
    const { leftbar, rightbar, backLayer } = this.refs;

    rightbar.style.transform = value
      ? 'translate(0)'
      : 'translate(100%)';

    if (value && leftbar) {
      leftbar.style.transform = 'translate(-100%)';
    }

    backLayer.style.opacity = value
      ? 1
      : 0;

    backLayer.style['pointer-events'] = value
      ? ''
      : 'none';

    this._barCoef = value ? -1 : null;
  }

  _closeAll() {
    if (this._barCoef === 1) {
      this._toggleLeftbar(false);
    } else {
      this._toggleRightbar(false);
    }
  }

  _onTouchStart(e) {
    if (this._identifier !== null) {
      return;
    }

    const touch = e.targetTouches[0];

    if (!this._barCoef) {
      this._startOffset = 0;
    } else if (this._barCoef === 1) {
      this._startOffset = Math.max(this.refs.leftbar.offsetWidth - touch.clientX, 0);
    } else if (this._barCoef === -1) {
      this._startOffset = Math.max(touch.clientX - document.body.offsetWidth + this.refs.rightbar.offsetWidth, 0);
    }

    if (!this._barCoef) {
      if (this.props.Leftbar && touch.clientX <= 16) {
        this._barCoef = 1;
      } else if (this.props.Rightbar && (touch.clientX >= document.body.offsetWidth - 16)) {
        this._barCoef = -1;
      }
    }

    if (!this._barCoef) {
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

    for (let i = 0, n = e.targetTouches.length; i < n; i++) {
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

    const sidebar = this._barCoef === 1 ? this.refs.leftbar : this.refs.rightbar;
    const width = sidebar.offsetWidth;

    if (this._barCoef === 1 && width - this._clientX < this._startOffset) {
      this._startOffset = Math.max(width - this._clientX, 0);
    } else if (this._barCoef === -1 && touch.clientX - document.body.offsetWidth + width < this._startOffset) {
      this._startOffset = Math.max(touch.clientX - document.body.offsetWidth + width, 0);
    }

    const sidebarPosition = this._barCoef === 1
      ? Math.max(Math.min(this._clientX - width + this._startOffset, 0), -width)
      : Math.max(Math.min(width - document.body.offsetWidth + this._clientX - this._startOffset, width), 0);

    sidebar.style.transform = `translate(${sidebarPosition}px)`;
    this.refs.backLayer.style.opacity = 1 + this._barCoef * sidebarPosition / width;
    this.refs.backLayer.style['pointer-events'] = 'all';
  }

  _onTouchEnd() {
    if (this._identifier === null) {
      return;
    }

    const sidebar = this._barCoef === 1 ? this.refs.leftbar : this.refs.rightbar;
    const width = sidebar.offsetWidth;

    let sidebarPosition;

    if (this._barCoef === 1) {
      if (this._offsetX > 10) {
        sidebarPosition = 0;
      } else if (this._offsetX < -10) {
        sidebarPosition = -width;
      } else {
        sidebarPosition = this._clientX > width / 2
          ? 0
          : -width;
      }
    } else {
      if (this._offsetX < -10) {
        sidebarPosition = 0;
      } else if (this._offsetX > 10) {
        sidebarPosition = width;
      } else {
        sidebarPosition = this._clientX > (document.body.offsetWidth - width / 2)
          ? width
          : 0;
      }
    }

    sidebar.style.transform = `translate(${sidebarPosition}px)`;
    this.refs.backLayer.style.opacity = sidebarPosition === 0 ? 1 : 0;
    this.refs.backLayer.style['pointer-events'] = sidebarPosition === 0 ? 'all' : 'none';
    this._identifier = null;
    this._isDragConfirmed = false;

    if (sidebarPosition !== 0) {
      this._barCoef = null;
    }
  }

  _onTouchCancel() {
    if (this._identifier === null) {
      return;
    }

    this._identifier = null;
  }

  render() {
    const { children, Leftbar, Rightbar } = this.props;

    return (
      <div>
        {Leftbar && (
          <div ref="leftbar" style={leftbarStyle}>
            <Leftbar toggle={this._toggleLeftbar} />
          </div>
        )}
        {Rightbar && (
          <div ref="rightbar" style={rightbarStyle}>
            <Rightbar toggle={this._toggleRightbar} />
          </div>
        )}
        {typeof children === 'function'
          ? children(this._childrenProps)
          : children}
        <div ref="backLayer" style={backLayerStyle} onClick={this._closeAll} />
      </div>
    );
  }
}

export default SidebarLayout;
