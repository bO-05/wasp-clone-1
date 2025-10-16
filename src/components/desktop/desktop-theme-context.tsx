"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface DesktopTheme {
  backgroundColor: string;
  accentColor: string;
  gridColor: string;
}

interface DesktopThemeContextType {
  theme: DesktopTheme;
  updateTheme: (theme: Partial<DesktopTheme>) => void;
  resetTheme: () => void;
}

const DEFAULT_THEME: DesktopTheme = {
  backgroundColor: "#000000",
  accentColor: "#FECC00",
  gridColor: "rgba(254, 204, 0, 0.03)",
};

const DesktopThemeContext = createContext<DesktopThemeContextType | undefined>(undefined);

export function DesktopThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<DesktopTheme>(DEFAULT_THEME);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("desktop-theme");
      if (saved) {
        setTheme(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load desktop theme", e);
    }
    setIsLoaded(true);
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("desktop-theme", JSON.stringify(theme));
    } catch (e) {
      console.error("Failed to save desktop theme", e);
    }
  }, [theme, isLoaded]);

  const updateTheme = (newTheme: Partial<DesktopTheme>) => {
    setTheme((prev) => ({ ...prev, ...newTheme }));
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
  };

  return (
    <DesktopThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </DesktopThemeContext.Provider>
  );
}

export function useDesktopTheme() {
  const context = useContext(DesktopThemeContext);
  if (!context) {
    throw new Error("useDesktopTheme must be used within DesktopThemeProvider");
  }
  return context;
}