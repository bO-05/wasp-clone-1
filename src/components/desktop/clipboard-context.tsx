"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ClipboardContextType {
  content: string;
  copy: (text: string) => void;
  paste: () => string;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const ClipboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<string>('');

  const copy = useCallback((text: string) => {
    setContent(text);
    // Also copy to system clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {
        // Silently fail if clipboard API not available
      });
    }
  }, []);

  const paste = useCallback(() => {
    return content;
  }, [content]);

  return (
    <ClipboardContext.Provider value={{ content, copy, paste }}>
      {children}
    </ClipboardContext.Provider>
  );
};

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within ClipboardProvider');
  }
  return context;
};