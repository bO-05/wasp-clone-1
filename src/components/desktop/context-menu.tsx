"use client";

import React, { useEffect, useRef } from "react";
import { LucideIcon } from "lucide-react";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Delay adding listeners to prevent immediate close
    setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu on screen
  const adjustedStyle = (() => {
    if (!menuRef.current) return { left: x, top: y };

    const menuWidth = 200;
    const menuHeight = items.length * 32 + 8;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > screenWidth) {
      adjustedX = screenWidth - menuWidth - 8;
    }

    if (y + menuHeight > screenHeight) {
      adjustedY = screenHeight - menuHeight - 8;
    }

    return { left: adjustedX, top: adjustedY };
  })();

  return (
    <div
      ref={menuRef}
      className="fixed z-[10001] w-48 border border-[#FECC00]/30 bg-black shadow-2xl"
      style={adjustedStyle}
    >
      <div className="py-1">
        {items.map((item) =>
          item.separator ? (
            <div key={item.id} className="my-1 h-px bg-white/10" />
          ) : (
            <button
              key={item.id}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  onClose();
                }
              }}
              disabled={item.disabled}
              className={`flex w-full items-center space-x-3 px-4 py-2 text-left text-sm transition-colors ${
                item.disabled
                  ? "cursor-not-allowed text-white/30"
                  : "text-white hover:bg-[#FECC00]/20 hover:text-[#FECC00]"
              }`}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}