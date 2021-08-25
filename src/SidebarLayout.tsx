import React, {
  useCallback,
  useRef,
  useEffect,
  CSSProperties,
  ReactNode,
  JSXElementConstructor,
} from 'react';

const sidebarStyle: CSSProperties = {
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

const leftBarStyle: CSSProperties = {
  ...sidebarStyle,
  left: 0,
  transform: 'translate(-100%)'
};

const rightBarStyle: CSSProperties = {
  ...sidebarStyle,
  right: 0,
  transform: 'translate(100%)'
};

const backLayerStyle: CSSProperties = {
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

export interface SidebarLayoutToggleFunction {
  (value?: boolean): void
}

export type SidebarLayoutComponent = JSXElementConstructor<{ toggle: SidebarLayoutToggleFunction }>;

export interface SidebarLayoutProps {
  children: ReactNode | ((params: {
    toggleLeftBar: SidebarLayoutToggleFunction,
    toggleRightBar: SidebarLayoutToggleFunction,
    // backward compatibility
    toggleLeftbar: SidebarLayoutToggleFunction,
    toggleRightbar: SidebarLayoutToggleFunction,
  }) => ReactNode),
  LeftBar?: SidebarLayoutComponent,
  RightBar?: SidebarLayoutComponent,
  // backward compatibility
  Leftbar?: SidebarLayoutComponent,
  Rightbar?: SidebarLayoutComponent,
}

const SidebarLayout = ({
  children,
  LeftBar: LeftBarNext,
  RightBar: RightBarNext,
  Leftbar,
  Rightbar,
}: SidebarLayoutProps) => {
  const LeftBar = LeftBarNext || Leftbar;
  const RightBar = RightBarNext || Rightbar;

  const barCoefRef = useRef<number | null>(null);
  const leftBarRef = useRef<HTMLDivElement | null>(null);
  const rightBarRef = useRef<HTMLDivElement | null>(null);
  const backLayerRef = useRef<HTMLDivElement | null>(null);
  const isDragConfirmedRef = useRef(false);
  const identifierRef = useRef<number | null>(null);
  const startOffsetRef = useRef(0);
  const offsetXRef = useRef(0);

  const touchStartPositionRef = useRef({
    clientX: 0,
    clientY: 0,
  });

  const toggleLeftBar = useCallback<SidebarLayoutToggleFunction>((value = (barCoefRef.current !== 1)) => {
    if (leftBarRef.current != null) {
      leftBarRef.current.style.transform = value
        ? 'translate(0)'
        : 'translate(-100%)';
    }

    if (value && rightBarRef.current != null) {
      rightBarRef.current.style.transform = 'translate(100%)';
    }

    if (backLayerRef.current != null) {
      backLayerRef.current.style.opacity = value ? '1' : '0';
      backLayerRef.current.style.pointerEvents = value ? '' : 'none';
    }

    barCoefRef.current = value ? 1 : null;
  }, []);

  const toggleRightBar = useCallback<SidebarLayoutToggleFunction>((value = (barCoefRef.current !== -1)) => {
    if (rightBarRef.current != null) {
      rightBarRef.current.style.transform = value
        ? 'translate(0)'
        : 'translate(100%)';
    }

    if (value && leftBarRef.current != null) {
      leftBarRef.current.style.transform = 'translate(-100%)';
    }

    if (backLayerRef.current != null) {
      backLayerRef.current.style.opacity = value ? '1' : '0';
      backLayerRef.current.style.pointerEvents = value ? '' : 'none';
    }

    barCoefRef.current = value ? -1 : null;
  }, []);

  const methodsRef = useRef({
    toggleLeftBar,
    toggleRightBar,
  });

  methodsRef.current.toggleLeftBar = toggleLeftBar;
  methodsRef.current.toggleRightBar = toggleRightBar;

  const closeAll = useCallback(() => {
    if (barCoefRef.current === 1) {
      methodsRef.current.toggleLeftBar(false);
    } else {
      methodsRef.current.toggleRightBar(false);
    }
  }, []);

  const onTouchStart = useCallback((event: TouchEvent) => {
    if (identifierRef.current != null) {
      return;
    }

    const touch = event.targetTouches[0];

    if (!barCoefRef.current) {
      startOffsetRef.current = 0;
    } else if (barCoefRef.current === 1) {
      if (leftBarRef.current != null) {
        startOffsetRef.current = Math.max(leftBarRef.current.offsetWidth - touch.clientX, 0);
      }
    } else if (barCoefRef.current === -1) {
      if (rightBarRef.current != null) {
        startOffsetRef.current = Math.max(touch.clientX - document.body.offsetWidth + rightBarRef.current.offsetWidth, 0);
      }
    }

    if (!barCoefRef.current) {
      if (leftBarRef.current != null && touch.clientX <= 16) {
        barCoefRef.current = 1;
      } else if (rightBarRef.current != null && (touch.clientX >= document.body.offsetWidth - 16)) {
        barCoefRef.current = -1;
      }
    }

    if (!barCoefRef.current) {
      return;
    }

    identifierRef.current = touch.identifier;
    touchStartPositionRef.current.clientX = touch.clientX;
    touchStartPositionRef.current.clientY = touch.clientY;
  }, []);

  const onTouchCancel = useCallback(() => {
    identifierRef.current = null;
  }, []);

  const onTouchMove = useCallback((event: TouchEvent) => {
    if (identifierRef.current == null) {
      return;
    }

    let touch;

    for (let i = 0, n = event.targetTouches.length; i < n; i++) {
      const currentTouch = event.targetTouches[i];

      if (currentTouch.identifier === identifierRef.current) {
        touch = currentTouch;
        break;
      }
    }

    if (!touch) {
      return;
    }

    offsetXRef.current = touch.clientX - touchStartPositionRef.current.clientX;

    if (!isDragConfirmedRef.current) {
      const offsetX = Math.abs(touch.clientX - touchStartPositionRef.current.clientX);
      const offsetY = Math.abs(touch.clientY - touchStartPositionRef.current.clientY);

      if (offsetY > offsetX) {
        onTouchCancel();
        return;
      }

      isDragConfirmedRef.current = true;
    }

    event.preventDefault();

    touchStartPositionRef.current.clientX = touch.clientX;
    touchStartPositionRef.current.clientY = touch.clientY;

    const sidebarRef = barCoefRef.current === 1 ? leftBarRef : rightBarRef;
    let sidebarPosition = 0;
    let width = 0;

    if (sidebarRef.current != null) {
      width = sidebarRef.current.offsetWidth;

      if (barCoefRef.current === 1 && width - touchStartPositionRef.current.clientX < startOffsetRef.current) {
        startOffsetRef.current = Math.max(width - touchStartPositionRef.current.clientX, 0);
      } else if (barCoefRef.current === -1 && touch.clientX - document.body.offsetWidth + width < startOffsetRef.current) {
        startOffsetRef.current = Math.max(touch.clientX - document.body.offsetWidth + width, 0);
      }

      sidebarPosition = barCoefRef.current === 1
        ? Math.max(
          Math.min(
            touchStartPositionRef.current.clientX - width + startOffsetRef.current,
            0,
          ),
          -width,
        )
        : Math.max(
          Math.min(
            width - document.body.offsetWidth + touchStartPositionRef.current.clientX - startOffsetRef.current,
            width,
          ),
          0,
        );

      sidebarRef.current.style.transform = `translate(${sidebarPosition}px)`;
    }

    if (backLayerRef.current != null) {
      if (barCoefRef.current != null) {
        backLayerRef.current.style.opacity = `${1 + barCoefRef.current * sidebarPosition / width}`;
      }

      backLayerRef.current.style.pointerEvents = 'all';
    }
  }, [onTouchCancel]);

  const onTouchEnd = useCallback(() => {
    if (identifierRef.current == null) {
      return;
    }

    const sideBarRef = barCoefRef.current === 1 ? leftBarRef : rightBarRef;
    let sidebarPosition;

    if (sideBarRef.current != null) {
      const width = sideBarRef.current.offsetWidth;

      if (barCoefRef.current === 1) {
        if (offsetXRef.current > 10) {
          sidebarPosition = 0;
        } else if (offsetXRef.current < -10) {
          sidebarPosition = -width;
        } else {
          sidebarPosition = touchStartPositionRef.current.clientX > width / 2
            ? 0
            : -width;
        }
      } else {
        if (offsetXRef.current < -10) {
          sidebarPosition = 0;
        } else if (offsetXRef.current > 10) {
          sidebarPosition = width;
        } else {
          sidebarPosition = touchStartPositionRef.current.clientX > (document.body.offsetWidth - width / 2)
            ? width
            : 0;
        }
      }

      sideBarRef.current.style.transform = `translate(${sidebarPosition}px)`;
    }

    if (backLayerRef.current != null) {
      backLayerRef.current.style.opacity = sidebarPosition === 0 ? '1' : '0';
      backLayerRef.current.style.pointerEvents = sidebarPosition === 0 ? 'all' : 'none';
    }

    identifierRef.current = null;
    isDragConfirmedRef.current = false;

    if (sidebarPosition !== 0) {
      barCoefRef.current = null;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchCancel);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd, onTouchCancel]);

  return (
    <div>
      {LeftBar && (
        <div ref={leftBarRef} style={leftBarStyle}>
          <LeftBar toggle={toggleLeftBar} />
        </div>
      )}
      {RightBar && (
        <div ref={rightBarRef} style={rightBarStyle}>
          <RightBar toggle={toggleRightBar} />
        </div>
      )}
      {typeof children === 'function'
        ? children({
          toggleLeftBar,
          toggleRightBar,
          // backward compatibility
          toggleLeftbar: toggleLeftBar,
          toggleRightbar: toggleRightBar,
        })
        : children}
      <div ref={backLayerRef} style={backLayerStyle} onClick={closeAll} />
    </div>
  );
};

export default React.memo(SidebarLayout);
