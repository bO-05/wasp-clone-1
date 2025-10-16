import { Terminal, FileText, FolderOpen, Settings, Gamepad2 } from "lucide-react";
import TerminalApp from "./terminal-app";
import NotesApp from "./notes-app";
import FilesApp from "./files-app";
import SettingsApp from "./settings-app";
import SnakeApp from "./snake-app";

export interface AppDefinition {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

export const appRegistry: AppDefinition[] = [
  {
    id: "terminal",
    name: "Terminal",
    icon: Terminal,
    component: TerminalApp,
    description: "Command-line interface with AI assistance",
    badge: "AI",
  },
  {
    id: "snake",
    name: "Snake",
    icon: Gamepad2,
    component: SnakeApp,
    description: "Classic snake game with leaderboard",
  },
  {
    id: "notes",
    name: "Notes",
    icon: FileText,
    component: NotesApp,
    description: "Take and sync notes",
  },
  {
    id: "files",
    name: "Files",
    icon: FolderOpen,
    component: FilesApp,
    description: "Browse your files",
  },
  {
    id: "settings",
    name: "Settings",
    icon: Settings,
    component: SettingsApp,
    description: "Configure your desktop",
  },
];