"use client";

import { Monitor, Grid3x3, Palette, RotateCcw } from "lucide-react";
import { useDesktopTheme } from "../desktop-theme-context";
import { useState } from "react";

export default function SettingsApp() {
  const { theme, updateTheme, resetTheme } = useDesktopTheme();
  const [localBgColor, setLocalBgColor] = useState(theme.backgroundColor);
  const [localAccentColor, setLocalAccentColor] = useState(theme.accentColor);

  const handleBgColorChange = (color: string) => {
    setLocalBgColor(color);
    updateTheme({ backgroundColor: color });
  };

  const handleAccentColorChange = (color: string) => {
    setLocalAccentColor(color);
    updateTheme({ accentColor: color });
    
    // Update grid color based on accent
    const rgb = hexToRgb(color);
    if (rgb) {
      const gridColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03)`;
      updateTheme({ gridColor });
    }
  };

  const handleReset = () => {
    resetTheme();
    setLocalBgColor("#000000");
    setLocalAccentColor("#FECC00");
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const presetThemes = [
    { name: "Wasp Yellow", bg: "#000000", accent: "#FECC00" },
    { name: "Cyber Blue", bg: "#0a0a0a", accent: "#00d4ff" },
    { name: "Matrix Green", bg: "#000000", accent: "#00ff41" },
    { name: "Hot Pink", bg: "#0a0a0a", accent: "#ff0080" },
    { name: "Purple Haze", bg: "#0a0a0a", accent: "#b565ff" },
    { name: "Orange Blast", bg: "#000000", accent: "#ff6b00" },
  ];

  return (
    <div className="h-full overflow-y-auto bg-black p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Desktop Settings</h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 border border-white/20 px-3 py-1.5 text-xs font-bold uppercase text-white transition-all hover:border-[#FECC00] hover:text-[#FECC00]"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Theme Colors */}
        <div className="border border-white/10 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5" style={{ color: theme.accentColor }} />
            <h3 className="font-bold text-white">Theme Colors</h3>
          </div>
          
          <div className="space-y-4">
            {/* Background Color */}
            <div>
              <label className="mb-2 block text-sm text-white/70">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={localBgColor}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  className="h-10 w-20 cursor-pointer border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={localBgColor}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  className="flex-1 border border-white/20 bg-black px-3 py-2 text-sm font-mono text-white outline-none focus:border-[#FECC00]"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="mb-2 block text-sm text-white/70">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={localAccentColor}
                  onChange={(e) => handleAccentColorChange(e.target.value)}
                  className="h-10 w-20 cursor-pointer border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={localAccentColor}
                  onChange={(e) => handleAccentColorChange(e.target.value)}
                  className="flex-1 border border-white/20 bg-black px-3 py-2 text-sm font-mono text-white outline-none focus:border-[#FECC00]"
                  placeholder="#FECC00"
                />
              </div>
            </div>
          </div>

          {/* Preset Themes */}
          <div className="mt-4">
            <label className="mb-2 block text-sm text-white/70">Preset Themes</label>
            <div className="grid grid-cols-2 gap-2">
              {presetThemes.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    handleBgColorChange(preset.bg);
                    handleAccentColorChange(preset.accent);
                  }}
                  className="flex items-center gap-2 border border-white/10 p-2 text-left text-sm transition-all hover:border-white/30"
                >
                  <div
                    className="h-6 w-6 border border-white/20"
                    style={{ backgroundColor: preset.accent }}
                  />
                  <span className="text-white/80">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Display */}
        <div className="border border-white/10 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Monitor className="h-5 w-5" style={{ color: theme.accentColor }} />
            <h3 className="font-bold text-white">Display</h3>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <p>Resolution: 1920x1080</p>
            <p>Refresh Rate: 60Hz</p>
          </div>
        </div>

        {/* Grid */}
        <div className="border border-white/10 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" style={{ color: theme.accentColor }} />
            <h3 className="font-bold text-white">Grid</h3>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <p>Grid Size: 32px</p>
            <p>Grid Opacity: 3%</p>
            <p>Grid Color: Based on accent color</p>
          </div>
        </div>

        {/* About */}
        <div className="border border-white/10 p-4">
          <h3 className="mb-3 font-bold text-white">About</h3>
          <div className="space-y-1 text-sm text-white/70">
            <p>WASP Desktop OS</p>
            <p>Version 1.0.0</p>
            <p>Swiss Grid Aesthetic</p>
            <p className="mt-3 text-xs">
              💡 Tip: Theme changes only affect the desktop, not the landing page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}