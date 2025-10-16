"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, Maximize2, Minimize2, XCircle, FolderOpen, Terminal, FileText, Settings, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Taskbar from "./taskbar";
import Window from "./window";
import ContextMenu, { ContextMenuItem } from "./context-menu";
import { ClipboardProvider } from "./clipboard-context";
import { DesktopThemeProvider, useDesktopTheme } from "./desktop-theme-context";
import { appRegistry } from "./apps/registry";

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  closing?: boolean;
}

function DesktopOSContent() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { theme } = useDesktopTheme();
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAiWelcome, setShowAiWelcome] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  // Load desktop settings - from database if authenticated, localStorage otherwise
  useEffect(() => {
    const loadDesktopSettings = async () => {
      // If authenticated, try to load from database
      if (session?.user) {
        try {
          const token = localStorage.getItem("bearer_token");
          const response = await fetch("/api/desktop/settings", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const settings = await response.json();
            if (settings.windowsState) {
              try {
                const parsed = JSON.parse(settings.windowsState);
                if (parsed.windows && Array.isArray(parsed.windows)) {
                  setWindows(parsed.windows);
                  setNextZIndex(parsed.nextZIndex || 100);
                }
              } catch (e) {
                console.error("Failed to parse windows state", e);
              }
            }
          }
        } catch (error) {
          console.error("Failed to load desktop settings:", error);
        }
      } else {
        // Not authenticated - use localStorage
        try {
          const saved = localStorage.getItem("desktop-state");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.windows && Array.isArray(parsed.windows)) {
              setWindows(parsed.windows);
              setNextZIndex(parsed.nextZIndex || 100);
            }
          }
        } catch (e) {
          console.error("Failed to load localStorage state", e);
        }
      }
      
      setIsLoaded(true);
    };

    if (!isPending) {
      loadDesktopSettings();
    }
  }, [session?.user, isPending]);

  // Save desktop settings - to database if authenticated, localStorage otherwise
  useEffect(() => {
    if (!isLoaded) return;

    const saveTimeout = setTimeout(async () => {
      const stateToSave = {
        windows: windows.map((w) => ({
          ...w,
          closing: false,
        })),
        nextZIndex,
      };

      // If authenticated, save to database
      if (session?.user) {
        setIsSyncing(true);
        try {
          const token = localStorage.getItem("bearer_token");
          const windowsState = JSON.stringify(stateToSave);

          await fetch("/api/desktop/settings", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              windowsState,
              theme: "dark",
            }),
          });
        } catch (error) {
          console.error("Failed to save desktop settings:", error);
        } finally {
          setIsSyncing(false);
        }
      } else {
        // Not authenticated - save to localStorage
        try {
          localStorage.setItem("desktop-state", JSON.stringify(stateToSave));
        } catch (e) {
          console.error("Failed to save to localStorage", e);
        }
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [windows, nextZIndex, isLoaded, session?.user]);

  // Show AI welcome message on first load
  useEffect(() => {
    if (isLoaded) {
      const hasSeenAiWelcome = localStorage.getItem("seen-ai-welcome");
      if (!hasSeenAiWelcome) {
        setTimeout(() => {
          setShowAiWelcome(true);
          localStorage.setItem("seen-ai-welcome", "true");
        }, 1500);
        
        setTimeout(() => {
          setShowAiWelcome(false);
        }, 8000);
      }
    }
  }, [isLoaded]);

  // Memoize active window calculation
  const activeWindowId = useMemo(() => {
    if (windows.length === 0) return null;
    return windows.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), windows[0]).id;
  }, [windows]);

  // Memoize visible windows
  const visibleWindows = useMemo(() => {
    return windows.filter((w) => !w.minimized && !w.closing);
  }, [windows]);

  const openApp = useCallback((appId: string) => {
    const app = appRegistry.find((a) => a.id === appId);
    if (!app) return;

    const existingWindow = windows.find((w) => w.appId === appId);
    if (existingWindow) {
      bringToFront(existingWindow.id);
      return;
    }

    const newWindow: WindowState = {
      id: `window-${Date.now()}`,
      appId,
      title: app.name,
      x: 100 + windows.length * 40,
      y: 80 + windows.length * 40,
      width: 800,
      height: 600,
      zIndex: nextZIndex,
      minimized: false,
      maximized: false,
    };

    setWindows((prev) => [...prev, newWindow]);
    setNextZIndex((z) => z + 1);
  }, [windows, nextZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, closing: true } : w))
    );
    setTimeout(() => {
      setWindows((prev) => prev.filter((w) => w.id !== id));
    }, 150);
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, minimized: false, zIndex: nextZIndex } : w
      )
    );
    setNextZIndex((z) => z + 1);
  }, [nextZIndex]);

  const toggleMaximize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w))
    );
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex } : w))
    );
    setNextZIndex((z) => z + 1);
  }, [nextZIndex]);

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  }, []);

  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, width, height } : w))
    );
  }, []);

  const handleSignOut = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const { error } = await authClient.signOut({
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (error?.code) {
        toast.error(error.code);
      } else {
        localStorage.removeItem("bearer_token");
        toast.success("Signed out successfully");
        window.location.reload();
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const items: ContextMenuItem[] = [
      {
        id: "open-terminal",
        label: "Open Terminal",
        icon: Terminal,
        onClick: () => openApp("terminal"),
      },
      {
        id: "open-notes",
        label: "Open Notes",
        icon: FileText,
        onClick: () => openApp("notes"),
      },
      {
        id: "open-files",
        label: "Open Files",
        icon: FolderOpen,
        onClick: () => openApp("files"),
      },
      {
        id: "open-settings",
        label: "Open Settings",
        icon: Settings,
        onClick: () => openApp("settings"),
      },
      {
        id: "separator-1",
        label: "",
        separator: true,
        onClick: () => {},
      },
      {
        id: "refresh",
        label: "Refresh Desktop",
        onClick: () => {
          setWindows([]);
        },
      },
    ];

    setContextMenu({ x: e.clientX, y: e.clientY, items });
  }, [openApp]);

  const handleWindowContextMenu = useCallback(
    (e: React.MouseEvent, windowId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const win = windows.find((w) => w.id === windowId);
      if (!win) return;

      const items: ContextMenuItem[] = [
        {
          id: "minimize",
          label: "Minimize",
          icon: Minimize2,
          onClick: () => minimizeWindow(windowId),
          disabled: win.minimized,
        },
        {
          id: "maximize",
          label: win.maximized ? "Restore" : "Maximize",
          icon: Maximize2,
          onClick: () => toggleMaximize(windowId),
        },
        {
          id: "separator-1",
          label: "",
          separator: true,
          onClick: () => {},
        },
        {
          id: "close",
          label: "Close",
          icon: XCircle,
          onClick: () => closeWindow(windowId),
        },
      ];

      setContextMenu({ x: e.clientX, y: e.clientY, items });
    },
    [windows, minimizeWindow, toggleMaximize, closeWindow]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key === "w") {
        e.preventDefault();
        const activeWindow = windows.find((w) => w.id === activeWindowId);
        if (activeWindow && !activeWindow.minimized) {
          closeWindow(activeWindowId);
        }
        return;
      }

      if (modKey && e.key === "m") {
        e.preventDefault();
        const activeWindow = windows.find((w) => w.id === activeWindowId);
        if (activeWindow && !activeWindow.minimized) {
          minimizeWindow(activeWindowId);
        }
        return;
      }

      if (modKey && e.key === "Tab") {
        e.preventDefault();
        const visibleWindows = windows.filter((w) => !w.minimized);
        if (visibleWindows.length <= 1) return;

        const sorted = [...visibleWindows].sort((a, b) => a.zIndex - b.zIndex);
        const currentIndex = sorted.findIndex((w) => w.id === activeWindowId);
        const nextIndex = (currentIndex + 1) % sorted.length;
        const nextWindow = sorted[nextIndex];

        bringToFront(nextWindow.id);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [windows, activeWindowId, closeWindow, minimizeWindow, bringToFront]);

  // Show loading state while initializing
  if (isPending || !isLoaded) {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div style={{ color: theme.accentColor }} className="text-xl font-bold">Loading Desktop OS...</div>
      </div>
    );
  }

  return (
    <ClipboardProvider>
      <div 
        className="fixed inset-0 z-[9999]"
        style={{ backgroundColor: theme.backgroundColor }}
        onContextMenu={handleDesktopContextMenu}
      >
        {/* Wallpaper with themed grid */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(${theme.gridColor} 1px, transparent 1px),
                linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Windows */}
        <div className="absolute inset-0 overflow-hidden">
          {windows
            .filter((w) => !w.minimized)
            .map((window) => {
              const app = appRegistry.find((a) => a.id === window.appId);
              if (!app) return null;

              return (
                <Window
                  key={window.id}
                  window={window}
                  app={app}
                  isActive={window.id === activeWindowId}
                  isClosing={window.closing}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => minimizeWindow(window.id)}
                  onMaximize={() => toggleMaximize(window.id)}
                  onFocus={() => bringToFront(window.id)}
                  onUpdatePosition={updateWindowPosition}
                  onUpdateSize={updateWindowSize}
                  onContextMenu={(e) => handleWindowContextMenu(e, window.id)}
                />
              );
            })}
        </div>

        {/* Taskbar */}
        <Taskbar
          windows={windows}
          onOpenApp={openApp}
          onRestoreWindow={restoreWindow}
          onCloseWindow={closeWindow}
        />

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={contextMenu.items}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* User menu (top-right) - only show if authenticated */}
        {session?.user && (
          <div className="fixed right-6 top-6 z-[10000] flex items-center gap-3">
            {/* Sync indicator */}
            {isSyncing && (
              <div className="text-xs flex items-center gap-1" style={{ color: `${theme.accentColor}60` }}>
                <div 
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ backgroundColor: theme.accentColor }}
                />
                Syncing...
              </div>
            )}
            
            {/* User info */}
            <div className="flex items-center gap-2 border border-white/20 bg-black/80 px-3 py-2 backdrop-blur-sm">
              <User className="h-4 w-4" style={{ color: theme.accentColor }} />
              <span className="text-sm text-white">{session.user.name || session.user.email}</span>
            </div>

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="flex h-10 w-10 items-center justify-center border border-white/20 bg-black/80 text-white backdrop-blur-sm transition-all hover:text-[#FECC00]"
              style={{ 
                borderColor: 'rgba(255,255,255,0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.accentColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Guest mode indicator (bottom-right) - only show if NOT authenticated */}
        {!session?.user && (
          <>
            {/* Desktop-only Sign In button (top-right) */}
            <div className="fixed right-6 top-6 z-[10000] flex items-center gap-3">
              <a
                href="/login?redirect=%2Fdesktop"
                className="border border-white/20 bg-black/80 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-[#FECC00] hover:text-[#FECC00]"
                title="Sign in for cloud sync"
              >
                Sign In
              </a>
            </div>

            <div className="fixed right-6 bottom-20 z-[10000] flex items-center gap-2 border border-white/20 bg-black/80 px-3 py-2 backdrop-blur-sm">
              <div 
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
              />
              <span className="text-xs text-white/60">Playground Mode (data saved locally)</span>
            </div>
          </>
        )}
      </div>
    </ClipboardProvider>
  );
}

export default function DesktopOS() {
  return (
    <DesktopThemeProvider>
      <DesktopOSContent />
    </DesktopThemeProvider>
  );
}