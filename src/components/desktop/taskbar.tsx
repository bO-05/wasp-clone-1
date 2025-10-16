"use client";

import { Terminal, FileText, FolderOpen, Settings, Clock, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import type { WindowState } from "./desktop-os";
import { appRegistry } from "./apps/registry";
import { useDesktopTheme } from "./desktop-theme-context";

interface TaskbarProps {
  windows: WindowState[];
  onOpenApp: (appId: string) => void;
  onRestoreWindow: (id: string) => void;
  onCloseWindow: (id: string) => void;
}

export default function Taskbar({
  windows,
  onOpenApp,
  onRestoreWindow,
}: TaskbarProps) {
  const [time, setTime] = useState(new Date());
  const { theme } = useDesktopTheme();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 z-[9998] h-12 border-t bg-black"
      style={{ borderTopColor: theme.accentColor }}
    >
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: App Launcher */}
        <div className="flex items-center gap-2">
          {appRegistry.map((app) => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className="relative flex h-8 w-8 items-center justify-center border border-white/20 text-white transition-all"
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.accentColor;
                e.currentTarget.style.color = theme.accentColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = 'white';
              }}
              title={`${app.name}${(app as any).badge === 'AI' ? ' - AI Powered' : ''}`}
            >
              <app.icon className="h-4 w-4" />
              {(app as any).badge === "AI" && (
                <span 
                  className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center animate-pulse"
                  style={{ color: theme.accentColor }}
                >
                  <Sparkles className="h-3 w-3" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Center: Running Windows */}
        <div className="flex items-center gap-2">
          {windows.map((window) => {
            const app = appRegistry.find((a) => a.id === window.appId);
            if (!app) return null;

            return (
              <button
                key={window.id}
                onClick={() => {
                  if (window.minimized) {
                    onRestoreWindow(window.id);
                  }
                }}
                className={`flex items-center gap-2 border px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                  window.minimized
                    ? "border-white/20 text-white/60 hover:border-white/40"
                    : ""
                }`}
                style={{
                  borderColor: window.minimized ? 'rgba(255,255,255,0.2)' : theme.accentColor,
                  color: window.minimized ? 'rgba(255,255,255,0.6)' : theme.accentColor,
                }}
                title={window.title}
              >
                <app.icon className="h-3 w-3" />
                <span className="max-w-[120px] truncate">{window.title}</span>
                {(app as any).badge === "AI" && (
                  <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Clock */}
        <div className="flex items-center gap-2 border border-white/20 px-3 py-1.5 text-xs font-bold text-white">
          <Clock className="h-3 w-3" />
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}