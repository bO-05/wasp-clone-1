"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { Minimize2, Maximize2, X, Minus, Sparkles } from "lucide-react";
import type { WindowState } from "./desktop-os";
import type { AppDefinition } from "./apps/registry";
import { useDesktopTheme } from "./desktop-theme-context";

interface WindowProps {
  window: WindowState;
  app: AppDefinition;
  isActive: boolean;
  isClosing?: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize: (id: string, width: number, height: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

type SnapZone = 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;
type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

const Window = memo(function Window({
  window,
  app,
  isActive,
  isClosing,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdatePosition,
  onUpdateSize,
  onContextMenu,
}: WindowProps) {
  const { theme } = useDesktopTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [snapZone, setSnapZone] = useState<SnapZone>(null);
  const dragStartPos = useRef({ x: 0, y: 0, windowX: 0, windowY: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0, windowX: 0, windowY: 0 });
  const rafId = useRef<number | null>(null);

  const SNAP_THRESHOLD = 50;

  const detectSnapZone = (x: number, y: number): SnapZone => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 48;

    if (x < SNAP_THRESHOLD && y < SNAP_THRESHOLD) return 'top-left';
    if (x > screenWidth - SNAP_THRESHOLD && y < SNAP_THRESHOLD) return 'top-right';
    if (x < SNAP_THRESHOLD && y > screenHeight - SNAP_THRESHOLD) return 'bottom-left';
    if (x > screenWidth - SNAP_THRESHOLD && y > screenHeight - SNAP_THRESHOLD) return 'bottom-right';

    if (x < SNAP_THRESHOLD) return 'left';
    if (x > screenWidth - SNAP_THRESHOLD) return 'right';
    if (y < SNAP_THRESHOLD) return 'top';
    if (y > screenHeight - SNAP_THRESHOLD) return 'bottom';

    return null;
  };

  const getSnapPosition = (zone: SnapZone): { x: number; y: number; width: number; height: number } | null => {
    if (!zone) return null;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 48;
    const halfWidth = screenWidth / 2;
    const halfHeight = screenHeight / 2;

    switch (zone) {
      case 'left':
        return { x: 0, y: 0, width: halfWidth, height: screenHeight };
      case 'right':
        return { x: halfWidth, y: 0, width: halfWidth, height: screenHeight };
      case 'top':
        return { x: 0, y: 0, width: screenWidth, height: halfHeight };
      case 'bottom':
        return { x: 0, y: halfHeight, width: screenWidth, height: halfHeight };
      case 'top-left':
        return { x: 0, y: 0, width: halfWidth, height: halfHeight };
      case 'top-right':
        return { x: halfWidth, y: 0, width: halfWidth, height: halfHeight };
      case 'bottom-left':
        return { x: 0, y: halfHeight, width: halfWidth, height: halfHeight };
      case 'bottom-right':
        return { x: halfWidth, y: halfHeight, width: halfWidth, height: halfHeight };
      default:
        return null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.maximized) return;
    
    e.stopPropagation();
    setIsDragging(true);
    onFocus();
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      windowX: window.x,
      windowY: window.y,
    };
  };

  const handleDoubleClick = () => {
    onMaximize();
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: ResizeDirection) => {
    if (window.maximized) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    onFocus();
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: window.width,
      height: window.height,
      windowX: window.x,
      windowY: window.y,
    };
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId.current !== null) return;

      rafId.current = requestAnimationFrame(() => {
        if (isDragging) {
          const deltaX = e.clientX - dragStartPos.current.x;
          const deltaY = e.clientY - dragStartPos.current.y;
          const newX = dragStartPos.current.windowX + deltaX;
          const newY = dragStartPos.current.windowY + deltaY;

          onUpdatePosition(window.id, newX, newY);

          const zone = detectSnapZone(e.clientX, e.clientY);
          setSnapZone(zone);
        }

        if (isResizing && resizeDirection) {
          const deltaX = e.clientX - resizeStartPos.current.x;
          const deltaY = e.clientY - resizeStartPos.current.y;
          
          let newX = window.x;
          let newY = window.y;
          let newWidth = window.width;
          let newHeight = window.height;

          // Handle horizontal resizing
          if (resizeDirection.includes('e')) {
            newWidth = Math.max(400, resizeStartPos.current.width + deltaX);
          } else if (resizeDirection.includes('w')) {
            const widthChange = -deltaX;
            newWidth = Math.max(400, resizeStartPos.current.width + widthChange);
            if (newWidth > 400) {
              newX = resizeStartPos.current.windowX + deltaX;
            }
          }

          // Handle vertical resizing
          if (resizeDirection.includes('s')) {
            newHeight = Math.max(300, resizeStartPos.current.height + deltaY);
          } else if (resizeDirection.includes('n')) {
            const heightChange = -deltaY;
            newHeight = Math.max(300, resizeStartPos.current.height + heightChange);
            if (newHeight > 300) {
              newY = resizeStartPos.current.windowY + deltaY;
            }
          }

          onUpdatePosition(window.id, newX, newY);
          onUpdateSize(window.id, newWidth, newHeight);
        }

        rafId.current = null;
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging && snapZone) {
        const snapPos = getSnapPosition(snapZone);
        if (snapPos) {
          onUpdatePosition(window.id, snapPos.x, snapPos.y);
          onUpdateSize(window.id, snapPos.width, snapPos.height);
        }
      }

      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
      setSnapZone(null);

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [isDragging, isResizing, resizeDirection, window.id, window.x, window.y, window.width, window.height, onUpdatePosition, onUpdateSize, snapZone]);

  const style: React.CSSProperties = window.maximized
    ? {
        left: 0,
        top: 0,
        width: "100%",
        height: "calc(100vh - 48px)",
        zIndex: window.zIndex,
      }
    : {
        left: `${window.x}px`,
        top: `${window.y}px`,
        width: `${window.width}px`,
        height: `${window.height}px`,
        zIndex: window.zIndex,
      };

  const animationClass = isClosing ? 'animate-window-close' : 'animate-window-open';

  return (
    <>
      {snapZone && (
        <div
          className="absolute border-2 bg-[#FECC00]/10 pointer-events-none transition-all duration-150"
          style={{
            ...getSnapPosition(snapZone),
            zIndex: 9998,
            borderColor: theme.accentColor,
            backgroundColor: `${theme.accentColor}10`,
          }}
        />
      )}

      <div
        className={`absolute flex flex-col bg-card border ${animationClass} shadow-2xl`}
        style={{
          ...style,
          borderColor: isActive ? theme.accentColor : 'rgba(255,255,255,0.2)',
        }}
        onMouseDown={onFocus}
        onContextMenu={onContextMenu}
      >
        {/* Titlebar */}
        <div
          className="flex h-8 items-center justify-between border-b bg-black px-3 cursor-move select-none"
          style={{ borderBottomColor: `${theme.accentColor}30` }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          <div className="flex items-center space-x-2">
            <app.icon className="h-3.5 w-3.5" style={{ color: theme.accentColor }} />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              {window.title}
            </span>
            {(app as any).badge === "AI" && (
              <span 
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border animate-pulse"
                style={{ 
                  color: theme.accentColor,
                  borderColor: theme.accentColor,
                  backgroundColor: `${theme.accentColor}20`,
                }}
              >
                <Sparkles className="h-2.5 w-2.5" />
                AI
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={onMinimize}
              className="flex h-5 w-5 items-center justify-center text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title="Minimize (Cmd+M)"
            >
              <Minus className="h-3 w-3" />
            </button>
            <button
              onClick={onMaximize}
              className="flex h-5 w-5 items-center justify-center text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title="Maximize"
            >
              {window.maximized ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={onClose}
              className="flex h-5 w-5 items-center justify-center text-white/60 transition-colors hover:text-black"
              style={{
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.accentColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Close (Cmd+W)"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-black">
          <app.component />
        </div>

        {/* Resize handles */}
        {!window.maximized && (
          <>
            {/* Edge handles */}
            <div
              className="absolute top-0 left-0 right-0 h-1 cursor-n-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 's')}
            />
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-w-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-e-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
            />

            {/* Corner handles */}
            <div
              className="absolute top-0 left-0 h-3 w-3 cursor-nw-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            />
            <div
              className="absolute top-0 right-0 h-3 w-3 cursor-ne-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            />
            <div
              className="absolute bottom-0 left-0 h-3 w-3 cursor-sw-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            />
            <div
              className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            >
              <div 
                className="absolute bottom-1 right-1 h-2 w-2 border-b-2 border-r-2"
                style={{ borderColor: `${theme.accentColor}50` }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
});

export default Window;