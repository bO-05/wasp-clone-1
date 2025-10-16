"use client";

import { useState, useRef, useEffect, memo } from "react";
import { useClipboard } from "../clipboard-context";
import { useSession } from "@/lib/auth-client";

interface HistoryEntry {
  type: "command" | "output" | "ai-thinking";
  text: string;
}

interface FileNode {
  id?: number;
  name: string;
  path: string;
  type: "file" | "directory";
  content?: string;
  user_id?: string;
}

// Optimize: Memoized history entry component
const HistoryEntryComponent = memo(({ entry }: { entry: HistoryEntry }) => {
  if (entry.type === "command") {
    return (
      <div className="flex gap-2">
        <span className="text-[#FECC00]">$</span>
        <span>{entry.text}</span>
      </div>
    );
  }
  
  if (entry.type === "ai-thinking") {
    return (
      <div className="text-[#FECC00] animate-pulse my-2">
        {entry.text}
      </div>
    );
  }
  
  return (
    <div className="whitespace-pre-wrap text-white/90 leading-relaxed">
      {entry.text}
    </div>
  );
});
HistoryEntryComponent.displayName = "HistoryEntry";

// Optimize: Max history entries to prevent performance issues
const MAX_HISTORY_ENTRIES = 500;

export default function TerminalApp() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: "output", text: "WASP Terminal v1.0.0 - Powered by Mistral AI" },
    { type: "output", text: 'Type "help" for available commands.' },
    { type: "output", text: '💡 NEW: Use "ai <question>" to chat with Mistral AI!' },
    { type: "output", text: '   Examples: ai explain javascript | ai write a poem | ai help me code' },
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempInput, setTempInput] = useState("");
  const [currentPath, setCurrentPath] = useState("/home");
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiConversation, setAiConversation] = useState<Array<{ role: string; content: string }>>([]);
  const [selectedText, setSelectedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editFilePath, setEditFilePath] = useState("");
  const [editContent, setEditContent] = useState("");
  const { copy, paste } = useClipboard();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Optimize: Limit history entries
  const addToHistory = (entry: HistoryEntry) => {
    setHistory(prev => {
      const newHistory = [...prev, entry];
      if (newHistory.length > MAX_HISTORY_ENTRIES) {
        return newHistory.slice(-MAX_HISTORY_ENTRIES);
      }
      return newHistory;
    });
  };

  // Initialize default files with ~/notes/ directory
  const initializeDefaultFiles = () => {
    const defaultFiles: FileNode[] = [
      {
        name: "home",
        path: "/home",
        type: "directory",
      },
      {
        name: "notes",
        path: "/home/notes",
        type: "directory",
      },
      {
        name: "default.txt",
        path: "/home/notes/default.txt",
        type: "file",
        content: "",
      },
      {
        name: "welcome.txt",
        path: "/home/welcome.txt",
        type: "file",
        content: "Welcome to WASP Desktop OS!\n\nThis is a virtual file system.\nTry these commands:\n- ls (list files)\n- mkdir foldername (create folder)\n- touch filename.txt (create file)\n- cat filename.txt (read file)\n- nano filename.txt (edit file)\n- cd foldername (change directory)\n- find . -name pattern (search files)\n- grep pattern file (search in file)\n\nHave fun exploring!",
      },
      {
        name: "readme.txt",
        path: "/home/readme.txt",
        type: "file",
        content: "WASP Desktop OS - README\n\nFeatures:\n- Virtual file system\n- Cloud sync (when signed in)\n- Terminal commands\n- File management\n- Notes integration (~/notes/)\n\nCommands:\nhelp, ls, cd, cat, mkdir, touch, rm, rmdir, mv, cp, nano, find, grep, pwd, whoami, date, about, clear, echo, tree, head, tail, wc",
      },
      {
        name: "documents",
        path: "/home/documents",
        type: "directory",
      },
      {
        name: "projects",
        path: "/home/projects",
        type: "directory",
      },
    ];
    return defaultFiles;
  };

  // Add file reload functionality
  const loadFilesFromAPI = async () => {
    if (session?.user?.id) {
      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch("/api/desktop/files", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const loadedFiles = data.files || [];
          if (loadedFiles.length === 0) {
            const defaults = initializeDefaultFiles();
            setFiles(defaults);
            for (const file of defaults) {
              await fetch("/api/desktop/files", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(file),
              });
            }
          } else {
            setFiles(loadedFiles);
          }
        }
      } catch (error) {
        console.error("Failed to load files:", error);
      }
    } else {
      try {
        const saved = localStorage.getItem("terminal-files");
        if (saved) {
          const parsedFiles = JSON.parse(saved);
          setFiles(parsedFiles.length === 0 ? initializeDefaultFiles() : parsedFiles);
        } else {
          setFiles(initializeDefaultFiles());
        }
      } catch (e) {
        console.error("Failed to load localStorage files", e);
        setFiles(initializeDefaultFiles());
      }
    }
  };

  // Load files - from database if authenticated, localStorage otherwise
  useEffect(() => {
    const loadFiles = async () => {
      await loadFilesFromAPI();
      setIsLoading(false);
    };
    
    loadFiles();
  }, [session?.user?.id]);

  // CRITICAL FIX: Reload files every 2 seconds to sync with Notes app
  useEffect(() => {
    const interval = setInterval(() => {
      void loadFilesFromAPI();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Save files to localStorage in guest mode
  useEffect(() => {
    if (!session?.user?.id && files.length > 0) {
      try {
        localStorage.setItem("terminal-files", JSON.stringify(files));
      } catch (e) {
        console.error("Failed to save files to localStorage", e);
      }
    }
  }, [files, session?.user?.id]);

  // Load command history - from database if authenticated, localStorage otherwise
  useEffect(() => {
    const loadHistory = async () => {
      if (session?.user?.id) {
        try {
          const token = localStorage.getItem("bearer_token");
          const response = await fetch("/api/desktop/terminal-history", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            const commands = data.history?.map((h: any) => h.command) || [];
            setCommandHistory(commands);
          }
        } catch (error) {
          console.error("Failed to load command history:", error);
        }
      } else {
        try {
          const saved = localStorage.getItem("terminal-history");
          if (saved) {
            setCommandHistory(JSON.parse(saved));
          }
        } catch (e) {
          console.error("Failed to load localStorage history", e);
        }
      }
    };
    
    loadHistory();
  }, [session?.user?.id]);

  // Save command history to localStorage in guest mode
  useEffect(() => {
    if (!session?.user?.id && commandHistory.length > 0) {
      try {
        localStorage.setItem("terminal-history", JSON.stringify(commandHistory));
      } catch (e) {
        console.error("Failed to save history to localStorage", e);
      }
    }
  }, [commandHistory, session?.user?.id]);

  // Optimize: Use RAF for smooth scrolling
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [history]);

  const resolvePath = (path: string): string => {
    // Expand tilde to /home
    if (path.startsWith("~")) {
      path = path.replace("~", "/home");
    }
    
    if (path.startsWith("/")) return path;
    
    const parts = currentPath.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);
    
    for (const part of pathParts) {
      if (part === "..") {
        parts.pop();
      } else if (part !== ".") {
        parts.push(part);
      }
    }
    
    return "/" + parts.join("/");
  };

  const getNodeByPath = (path: string): FileNode | null => {
    return files.find(f => f.path === path) || null;
  };

  const getChildrenOfPath = (path: string): FileNode[] => {
    return files.filter(f => {
      if (f.path === path) return false;
      const parentPath = f.path.substring(0, f.path.lastIndexOf("/")) || "/";
      return parentPath === path;
    });
  };

  const saveCommandToHistory = async (command: string) => {
    if (!session?.user?.id) return;
    
    try {
      const token = localStorage.getItem("bearer_token");
      await fetch("/api/desktop/terminal-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          command,
          output: "",
        }),
      });
    } catch (error) {
      console.error("Failed to save command history:", error);
    }
  };

  const normalizeArg = (arg?: string): string | undefined => {
    if (typeof arg !== "string") return arg;
    const trimmed = arg.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  };

  const getAllDescendants = (path: string): FileNode[] => {
    const results: FileNode[] = [];
    const children = getChildrenOfPath(path);
    
    for (const child of children) {
      results.push(child);
      if (child.type === "directory") {
        results.push(...getAllDescendants(child.path));
      }
    }
    
    return results;
  };

  const commands: Record<string, (args: string[]) => Promise<string> | string> = {
    help: () => `Available commands:
  ━━━ System Commands ━━━
  help     - Show this help message
  clear    - Clear terminal
  echo     - Print text
  about    - About this system
  date     - Show current date
  whoami   - Display current user
  
  ━━━ File System ━━━
  pwd      - Print working directory
  ls       - List directory contents
  cd       - Change directory
  tree     - Display directory tree
  
  ━━━ File Operations ━━━
  cat      - Display file contents
  touch    - Create empty file
  mkdir    - Create directory
  rm       - Remove file
  rmdir    - Remove empty directory
  mv       - Move/rename file or directory
  cp       - Copy file or directory
  nano     - Edit file (use Ctrl+S to save, Ctrl+X to exit)
  
  ━━━ File Analysis ━━━
  head     - Show first 10 lines of file
  tail     - Show last 10 lines of file
  wc       - Count lines, words, bytes
  
  ━━━ Search Commands ━━━
  find     - Search for files (find . -name pattern)
  grep     - Search text in files (grep pattern file)
  
  ━━━ AI Commands (Mistral AI) ━━━
  ai <question>  - Ask AI anything
  aihelp         - Show AI usage examples
  aimodel        - Show current AI model info
  aiclear        - Clear AI conversation context
  
  💡 Notes: Files in ~/notes/ are synced with Notes app
  💡 Tip: Try "ai" commands to interact with AI!`,

    aihelp: () => `Mistral AI Integration - Usage Examples:
  
  📌 General Questions:
    ai what is javascript?
    ai explain quantum computing simply
    ai tell me about black holes
  
  📌 Coding Help:
    ai how to sort an array in javascript
    ai explain async/await in python
    ai debug my code: [paste code]
  
  📌 Creative Tasks:
    ai write a haiku about coding
    ai generate a story about robots
    ai suggest project names
  
  📌 Problem Solving:
    ai help me plan a website
    ai suggest algorithm for [problem]
    ai review this architecture: [description]
  
  Model: Mistral Small (mistral-small-latest) - Optimized for speed
  Context: ${aiConversation.length} message(s) in current session
  
  Use 'aiclear' to reset conversation context`,

    aimodel: () => `AI Model Information:
  
  Model: Mistral Small Latest
  Endpoint: mistral-small-latest
  Provider: Mistral AI
  
  Capabilities:
  • Fast response times
  • Advanced reasoning and analysis
  • Code generation and debugging
  • Creative writing and storytelling
  • Multi-language support
  • Context-aware responses
  
  Session: ${aiConversation.length} exchanges in current context
  Status: ${isAiLoading ? "⏳ Processing..." : "✓ Ready"}`,

    aiclear: () => {
      setAiConversation([]);
      return "AI conversation context cleared. Starting fresh!";
    },

    clear: () => {
      setHistory([]);
      return "";
    },

    echo: (args) => args.join(" "),

    about: () => `WASP Desktop OS v1.0.0
A virtual operating system experience
Built with Next.js + React + TypeScript
Powered by Mistral AI (mistral-small-latest)
${session?.user?.id ? "Cloud-synced file system" : "Local file system (playground mode)"}

Try 'ai' commands to interact with AI!`,

    date: () => new Date().toString(),

    whoami: () => session?.user?.email || "guest@wasp-os",

    pwd: () => currentPath,

    ls: (args) => {
      const hasLongFlag = args.includes("-l") || args.includes("-la") || args.includes("-al");
      const hasAllFlag = args.includes("-a") || args.includes("-la") || args.includes("-al");
      const targetArg = args.find(a => !a.startsWith("-"));
      const target = normalizeArg(targetArg);
      const targetPath = target ? resolvePath(target) : currentPath;
      const node = getNodeByPath(targetPath);
      
      if (node && node.type === "file") {
        return node.name;
      }
      
      let children = getChildrenOfPath(targetPath);
      
      if (!hasAllFlag) {
        children = children.filter(f => !f.name.startsWith("."));
      }
      
      if (children.length === 0) {
        return "";
      }
      
      if (hasLongFlag) {
        return children.map(f => {
          const type = f.type === "directory" ? "d" : "-";
          const size = f.content?.length || 0;
          const name = f.type === "directory" ? `${f.name}/` : f.name;
          return `${type}rwxr-xr-x  1 user  user  ${size.toString().padStart(8)} ${name}`;
        }).join("\n");
      }
      
      return children.map(f => 
        f.type === "directory" ? `${f.name}/` : f.name
      ).join("  ");
    },

    tree: (args) => {
      const target = normalizeArg(args[0]);
      const targetPath = target ? resolvePath(target) : currentPath;
      const maxDepth = args.includes("-L") ? parseInt(args[args.indexOf("-L") + 1]) || 2 : 3;
      
      const buildTree = (path: string, prefix: string = "", depth: number = 0): string[] => {
        if (depth >= maxDepth) return [];
        
        const children = getChildrenOfPath(path);
        if (children.length === 0) return [];
        
        const lines: string[] = [];
        children.forEach((child, index) => {
          const isLast = index === children.length - 1;
          const connector = isLast ? "└── " : "├── ";
          const childPrefix = isLast ? "    " : "│   ";
          const name = child.type === "directory" ? `${child.name}/` : child.name;
          
          lines.push(`${prefix}${connector}${name}`);
          
          if (child.type === "directory") {
            lines.push(...buildTree(child.path, prefix + childPrefix, depth + 1));
          }
        });
        
        return lines;
      };
      
      const node = getNodeByPath(targetPath);
      const dirName = node?.name || targetPath.split("/").pop() || targetPath;
      const tree = [dirName + "/", ...buildTree(targetPath)];
      
      return tree.join("\n");
    },

    cd: (args) => {
      const raw = normalizeArg(args[0]);
      if (!raw) {
        setCurrentPath("/home");
        return "";
      }
      
      const targetPath = resolvePath(raw);
      const node = getNodeByPath(targetPath);
      const hasChildren = getChildrenOfPath(targetPath).length > 0;
      
      if (!node && !hasChildren && targetPath !== "/home") {
        return `cd: no such file or directory: ${args[0]}`;
      }
      
      if (node && node.type === "file") {
        return `cd: not a directory: ${args[0]}`;
      }
      
      setCurrentPath(targetPath);
      return "";
    },

    cat: (args) => {
      if (args.includes("-n")) {
        const fileArg = args.find(a => a !== "-n");
        const raw = normalizeArg(fileArg);
        if (!raw) return "cat: missing file operand";
        
        const targetPath = resolvePath(raw);
        const node = getNodeByPath(targetPath);
        
        if (!node) return `cat: ${fileArg}: No such file or directory`;
        if (node.type === "directory") return `cat: ${fileArg}: Is a directory`;
        if (!node.content) return "(empty file)";
        
        return node.content.split("\n").map((line, i) => `${i + 1}  ${line}`).join("\n");
      }
      
      const raw = normalizeArg(args[0]);
      if (!raw) return "cat: missing file operand";
      
      const targetPath = resolvePath(raw);
      const node = getNodeByPath(targetPath);
      
      if (!node) {
        return `cat: ${args[0]}: No such file or directory`;
      }
      
      if (node.type === "directory") {
        return `cat: ${args[0]}: Is a directory`;
      }
      
      if (node.content === undefined || node.content === "") {
        return "(empty file)";
      }
      return node.content;
    },

    head: (args) => {
      const lines = args.includes("-n") ? parseInt(args[args.indexOf("-n") + 1]) || 10 : 10;
      const fileArg = args.find(a => a !== "-n" && !a.match(/^\d+$/));
      const raw = normalizeArg(fileArg);
      if (!raw) return "head: missing file operand";
      
      const targetPath = resolvePath(raw);
      const node = getNodeByPath(targetPath);
      
      if (!node) return `head: ${fileArg}: No such file or directory`;
      if (node.type === "directory") return `head: ${fileArg}: Is a directory`;
      if (!node.content) return "(empty file)";
      
      return node.content.split("\n").slice(0, lines).join("\n");
    },

    tail: (args) => {
      const lines = args.includes("-n") ? parseInt(args[args.indexOf("-n") + 1]) || 10 : 10;
      const fileArg = args.find(a => a !== "-n" && !a.match(/^\d+$/));
      const raw = normalizeArg(fileArg);
      if (!raw) return "tail: missing file operand";
      
      const targetPath = resolvePath(raw);
      const node = getNodeByPath(targetPath);
      
      if (!node) return `tail: ${fileArg}: No such file or directory`;
      if (node.type === "directory") return `tail: ${fileArg}: Is a directory`;
      if (!node.content) return "(empty file)";
      
      const contentLines = node.content.split("\n");
      return contentLines.slice(-lines).join("\n");
    },

    wc: (args) => {
      const raw = normalizeArg(args[0]);
      if (!raw) return "wc: missing file operand";
      
      const targetPath = resolvePath(raw);
      const node = getNodeByPath(targetPath);
      
      if (!node) return `wc: ${args[0]}: No such file or directory`;
      if (node.type === "directory") return `wc: ${args[0]}: Is a directory`;
      
      const content = node.content || "";
      const lines = content.split("\n").length;
      const words = content.split(/\s+/).filter(Boolean).length;
      const bytes = content.length;
      
      return `  ${lines}  ${words}  ${bytes} ${node.name}`;
    },

    find: (args) => {
      const startArg = normalizeArg(args[0]) || ".";
      const startPath = resolvePath(startArg);
      const nameIndex = args.indexOf("-name");
      const pattern = nameIndex !== -1 ? normalizeArg(args[nameIndex + 1]) : "*";
      
      const findFiles = (path: string): string[] => {
        const results: string[] = [];
        const children = getChildrenOfPath(path);
        
        for (const child of children) {
          const matches = pattern === "*" || 
                         child.name.includes(pattern) || 
                         (pattern.startsWith("*.") && child.name.endsWith(pattern.slice(1)));
          
          if (matches) {
            results.push(child.path);
          }
          
          if (child.type === "directory") {
            results.push(...findFiles(child.path));
          }
        }
        
        return results;
      };
      
      const results = findFiles(startPath);
      return results.length > 0 ? results.join("\n") : "";
    },

    grep: (args) => {
      const pattern = normalizeArg(args[0]);
      const fileArg = normalizeArg(args[1]);
      
      if (!pattern) return "grep: missing search pattern";
      if (!fileArg) return "grep: missing file operand";
      
      const targetPath = resolvePath(fileArg);
      const node = getNodeByPath(targetPath);
      
      if (!node) return `grep: ${args[1]}: No such file or directory`;
      if (node.type === "directory") return `grep: ${args[1]}: Is a directory`;
      if (!node.content) return "";
      
      const lines = node.content.split("\n");
      const matches: string[] = [];
      
      lines.forEach((line, i) => {
        if (line.toLowerCase().includes(pattern.toLowerCase())) {
          matches.push(`${i + 1}:${line}`);
        }
      });
      
      return matches.length > 0 ? matches.join("\n") : "";
    },

    rm: async (args) => {
      const recursive = args.includes("-r") || args.includes("-rf");
      const force = args.includes("-f") || args.includes("-rf");
      const fileArgs = args.filter(a => !a.startsWith("-"));
      
      if (fileArgs.length === 0) return "rm: missing operand";
      
      const raw = normalizeArg(fileArgs[0]);
      if (!raw) return "rm: missing operand";
      
      const targetPath = resolvePath(raw);
      const node = getNodeByPath(targetPath);
      
      if (!node) {
        return force ? "" : `rm: cannot remove '${fileArgs[0]}': No such file or directory`;
      }
      
      if (node.type === "directory" && !recursive) {
        return `rm: cannot remove '${fileArgs[0]}': Is a directory (use -r for directories)`;
      }
      
      if (node.type === "directory") {
        const children = getChildrenOfPath(targetPath);
        if (children.length > 0 && !recursive) {
          return `rm: cannot remove '${fileArgs[0]}': Directory not empty (use -rf to force)`;
        }
        
        const toRemove = [node, ...getAllDescendants(targetPath)];
        
        if (session?.user?.id) {
          try {
            const token = localStorage.getItem("bearer_token");
            for (const item of toRemove) {
              if (item.id) {
                await fetch(`/api/desktop/files/${item.id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                });
              }
            }
            setFiles(prev => prev.filter(f => !toRemove.some(r => r.path === f.path)));
            return "";
          } catch (error) {
            return `rm: error removing '${fileArgs[0]}'`;
          }
        } else {
          setFiles(prev => prev.filter(f => !toRemove.some(r => r.path === f.path)));
          return "";
        }
      }
      
      if (session?.user?.id && node.id) {
        try {
          const token = localStorage.getItem("bearer_token");
          await fetch(`/api/desktop/files/${node.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          setFiles(prev => prev.filter(f => f.path !== targetPath));
          return "";
        } catch (error) {
          return `rm: error removing '${fileArgs[0]}'`;
        }
      } else {
        setFiles(prev => prev.filter(f => f.path !== targetPath));
        return "";
      }
    },

    rmdir: async (args) => {
      const raw = normalizeArg(args[0]);
      if (!raw) return "rmdir: missing operand";
      
      const targetPath = resolvePath(raw);
      const node = getNodeByPath(targetPath);
      
      if (!node) return `rmdir: failed to remove '${args[0]}': No such file or directory`;
      if (node.type !== "directory") return `rmdir: failed to remove '${args[0]}': Not a directory`;
      
      const children = getChildrenOfPath(targetPath);
      if (children.length > 0) {
        return `rmdir: failed to remove '${args[0]}': Directory not empty`;
      }
      
      if (session?.user?.id && node.id) {
        try {
          const token = localStorage.getItem("bearer_token");
          await fetch(`/api/desktop/files/${node.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          setFiles(prev => prev.filter(f => f.path !== targetPath));
          return "";
        } catch (error) {
          return `rmdir: error removing '${args[0]}'`;
        }
      } else {
        setFiles(prev => prev.filter(f => f.path !== targetPath));
        return "";
      }
    },

    mv: async (args) => {
      const source = normalizeArg(args[0]);
      const dest = normalizeArg(args[1]);
      
      if (!source || !dest) return "mv: missing file operand";
      
      const sourcePath = resolvePath(source);
      const sourceNode = getNodeByPath(sourcePath);
      
      if (!sourceNode) return `mv: cannot stat '${args[0]}': No such file or directory`;
      
      let destPath = resolvePath(dest);
      const destNode = getNodeByPath(destPath);
      
      if (destNode && destNode.type === "directory") {
        destPath = `${destPath}/${sourceNode.name}`;
      }
      
      const newName = destPath.substring(destPath.lastIndexOf("/") + 1);
      
      const toUpdate: FileNode[] = [sourceNode];
      if (sourceNode.type === "directory") {
        toUpdate.push(...getAllDescendants(sourcePath));
      }
      
      if (session?.user?.id) {
        try {
          const token = localStorage.getItem("bearer_token");
          
          if (sourceNode.id) {
            await fetch(`/api/desktop/files/${sourceNode.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                name: newName,
                path: destPath,
              }),
            });
          }
          
          for (const child of toUpdate.slice(1)) {
            const newChildPath = child.path.replace(sourcePath, destPath);
            if (child.id) {
              await fetch(`/api/desktop/files/${child.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  path: newChildPath,
                }),
              });
            }
          }
          
          setFiles(prev => prev.map(f => {
            if (f.path === sourcePath) {
              return { ...f, name: newName, path: destPath };
            }
            if (f.path.startsWith(sourcePath + "/")) {
              return { ...f, path: f.path.replace(sourcePath, destPath) };
            }
            return f;
          }));
          
          return "";
        } catch (error) {
          return `mv: error moving '${args[0]}'`;
        }
      } else {
        setFiles(prev => prev.map(f => {
          if (f.path === sourcePath) {
            return { ...f, name: newName, path: destPath };
          }
          if (f.path.startsWith(sourcePath + "/")) {
            return { ...f, path: f.path.replace(sourcePath, destPath) };
          }
          return f;
        }));
        return "";
      }
    },

    cp: async (args) => {
      const recursive = args.includes("-r");
      const sourceArg = args.find(a => !a.startsWith("-") && args.indexOf(a) === (args.includes("-r") ? 1 : 0));
      const destArg = args.find(a => !a.startsWith("-") && a !== sourceArg);
      
      const source = normalizeArg(sourceArg);
      const dest = normalizeArg(destArg);
      
      if (!source || !dest) return "cp: missing file operand";
      
      const sourcePath = resolvePath(source);
      const sourceNode = getNodeByPath(sourcePath);
      
      if (!sourceNode) return `cp: cannot stat '${sourceArg}': No such file or directory`;
      
      if (sourceNode.type === "directory" && !recursive) {
        return `cp: -r not specified; omitting directory '${sourceArg}'`;
      }
      
      let destPath = resolvePath(dest);
      const destNode = getNodeByPath(destPath);
      
      if (destNode && destNode.type === "directory") {
        destPath = `${destPath}/${sourceNode.name}`;
      }
      
      const copyNode = async (node: FileNode, newPath: string) => {
        const newName = newPath.substring(newPath.lastIndexOf("/") + 1);
        const newNode: FileNode = {
          name: newName,
          path: newPath,
          type: node.type,
          content: node.content,
        };
        
        if (session?.user?.id) {
          const token = localStorage.getItem("bearer_token");
          const response = await fetch("/api/desktop/files", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newNode),
          });
          
          if (response.ok) {
            const data = await response.json();
            return data.file;
          }
          return newNode;
        } else {
          return newNode;
        }
      };
      
      try {
        const newNode = await copyNode(sourceNode, destPath);
        setFiles(prev => [...prev, newNode]);
        
        if (sourceNode.type === "directory" && recursive) {
          const children = getAllDescendants(sourcePath);
          for (const child of children) {
            const newChildPath = child.path.replace(sourcePath, destPath);
            const newChild = await copyNode(child, newChildPath);
            setFiles(prev => [...prev, newChild]);
          }
        }
        
        return "";
      } catch (error) {
        return `cp: error copying '${sourceArg}'`;
      }
    },

    nano: (args) => {
      const raw = normalizeArg(args[0]);
      if (!raw) return "nano: missing file operand";
      
      const targetPath = resolvePath(raw);
      const node = getNodeByPath(targetPath);
      
      if (node && node.type === "directory") {
        return `nano: ${args[0]}: Is a directory`;
      }
      
      setIsEditing(true);
      setEditFilePath(targetPath);
      setEditContent(node?.content || "");
      
      setTimeout(() => editTextareaRef.current?.focus(), 50);
      
      return "";
    },

    mkdir: async (args) => {
      const raw = normalizeArg(args[0]);
      if (!raw) return "mkdir: missing operand";
      
      const targetPath = resolvePath(raw);
      const name = targetPath.substring(targetPath.lastIndexOf("/") + 1);
      
      if (getNodeByPath(targetPath)) {
        return `mkdir: cannot create directory '${args[0]}': File exists`;
      }
      
      if (session?.user?.id) {
        try {
          const token = localStorage.getItem("bearer_token");
          const response = await fetch("/api/desktop/files", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name,
              path: targetPath,
              type: "directory",
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setFiles(prev => [...prev, data.file]);
            return "";
          } else {
            return `mkdir: failed to create directory '${args[0]}'`;
          }
        } catch (error) {
          return `mkdir: error creating directory '${args[0]}'`;
        }
      } else {
        const newDir: FileNode = {
          name,
          path: targetPath,
          type: "directory",
        };
        setFiles(prev => [...prev, newDir]);
        return "";
      }
    },

    touch: async (args) => {
      const raw = normalizeArg(args[0]);
      if (!raw) return "touch: missing file operand";
      
      const targetPath = resolvePath(raw);
      const name = targetPath.substring(targetPath.lastIndexOf("/") + 1);
      
      const existing = getNodeByPath(targetPath);
      if (existing) {
        return "";
      }
      
      if (session?.user?.id) {
        try {
          const token = localStorage.getItem("bearer_token");
          const response = await fetch("/api/desktop/files", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name,
              path: targetPath,
              type: "file",
              content: "",
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setFiles(prev => [...prev, data.file]);
            return "";
          } else {
            return `touch: failed to create file '${args[0]}'`;
          }
        } catch (error) {
          return `touch: error creating file '${args[0]}'`;
        }
      } else {
        const newFile: FileNode = {
          name,
          path: targetPath,
          type: "file",
          content: "",
        };
        setFiles(prev => [...prev, newFile]);
        return "";
      }
    },

    ai: async (args) => {
      const question = args.join(" ");
      if (!question) {
        return `ai: Please provide a question.
  
Examples:
  ai what is javascript?
  ai write a poem about coding
  ai help me debug a function
  
Type 'aihelp' for more examples.`;
      }

      setIsAiLoading(true);
      addToHistory({ type: "ai-thinking", text: "🤖 AI is thinking..." });

      try {
        const response = await fetch("/api/mistral/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            message: question,
            conversationHistory: aiConversation.slice(-10),
          }),
        });

        // Remove thinking message
        setHistory((prev) => prev.filter(entry => entry.type !== "ai-thinking"));

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: "Unknown error" }));
          return `❌ AI Error: ${error.error || "Failed to get response"}
          
Troubleshooting:
  • Check your MISTRAL_API_KEY in .env
  • Verify Mistral AI service status
  • Try again in a moment`;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let aiResponse = "";

        if (reader) {
          // Add initial AI response entry - track its index
          const startIndex = history.length - 1; // -1 because we removed thinking message
          addToHistory({ type: "output", text: "🤖 Mistral AI (mistral-small-latest):\n\n" });

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    aiResponse += data.content;
                    // Update the same entry in real-time
                    setHistory((prev) => {
                      const newHistory = [...prev];
                      const responseIndex = startIndex + 1;
                      if (newHistory[responseIndex]) {
                        newHistory[responseIndex] = {
                          type: "output",
                          text: `🤖 Mistral AI (mistral-small-latest):\n\n${aiResponse}`,
                        };
                      }
                      return newHistory;
                    });
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Update conversation history
          setAiConversation((prev) => [
            ...prev,
            { role: "user", content: question },
            { role: "assistant", content: aiResponse },
          ]);

          // Add footer to the final response (update the same entry, don't create new one)
          setHistory((prev) => {
            const newHistory = [...prev];
            const responseIndex = startIndex + 1;
            if (newHistory[responseIndex]) {
              newHistory[responseIndex] = {
                type: "output",
                text: `🤖 Mistral AI (mistral-small-latest):\n\n${aiResponse}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💬 Context: ${aiConversation.length + 2} messages | Type 'aiclear' to reset`,
              };
            }
            return newHistory;
          });
        }

        return "";
      } catch (error) {
        // Remove thinking message on error
        setHistory((prev) => prev.filter(entry => entry.type !== "ai-thinking"));
        
        return `❌ Connection Error: Failed to reach Mistral AI
        
Possible causes:
  • Network connection issue
  • API key not configured
  • Mistral AI service unavailable
  
Solution: Check .env file for MISTRAL_API_KEY`;
      } finally {
        setIsAiLoading(false);
      }
    },
  };

  const saveEditedFile = async () => {
    const node = getNodeByPath(editFilePath);
    
    if (session?.user?.id) {
      try {
        const token = localStorage.getItem("bearer_token");
        
        if (node && node.id) {
          await fetch(`/api/desktop/files/${node.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: editContent }),
          });
          
          setFiles(prev => prev.map(f => 
            f.path === editFilePath ? { ...f, content: editContent } : f
          ));
        } else {
          const name = editFilePath.substring(editFilePath.lastIndexOf("/") + 1);
          const response = await fetch("/api/desktop/files", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name,
              path: editFilePath,
              type: "file",
              content: editContent,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setFiles(prev => [...prev, data.file]);
          }
        }
      } catch (error) {
        console.error("Failed to save file:", error);
      }
    } else {
      if (node) {
        setFiles(prev => prev.map(f => 
          f.path === editFilePath ? { ...f, content: editContent } : f
        ));
      } else {
        const name = editFilePath.substring(editFilePath.lastIndexOf("/") + 1);
        setFiles(prev => [...prev, {
          name,
          path: editFilePath,
          type: "file",
          content: editContent,
        }]);
      }
    }
    
    addToHistory({ 
      type: "output", 
      text: `File saved: ${editFilePath}` 
    });
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (modKey && e.key === 's') {
      e.preventDefault();
      saveEditedFile();
      return;
    }

    if (modKey && e.key === 'x') {
      e.preventDefault();
      setIsEditing(false);
      setEditFilePath("");
      setEditContent("");
      inputRef.current?.focus();
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (modKey && e.key === 'v') {
      e.preventDefault();
      const pastedText = paste();
      if (pastedText) {
        const inputEl = e.currentTarget;
        const start = inputEl.selectionStart || 0;
        const end = inputEl.selectionEnd || 0;
        const newInput = input.substring(0, start) + pastedText + input.substring(end);
        setInput(newInput);
        setTimeout(() => {
          inputEl.selectionStart = inputEl.selectionEnd = start + pastedText.length;
        }, 0);
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      
      if (historyIndex === -1) {
        setTempInput(input);
        setHistoryIndex(commandHistory.length - 1);
        setInput(commandHistory[commandHistory.length - 1]);
      } else if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setInput(commandHistory[historyIndex - 1]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      
      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setInput(commandHistory[historyIndex + 1]);
      } else {
        setHistoryIndex(-1);
        setInput(tempInput);
      }
    }
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selected = selection?.toString();
    if (selected) {
      setSelectedText(selected);
      copy(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAiLoading) return;

    const [cmd, ...args] = input.trim().split(" ");
    
    addToHistory({ type: "command", text: input });
    setCommandHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);
    setTempInput("");
    
    saveCommandToHistory(input);

    if (cmd === "clear") {
      setHistory([]);
      setInput("");
      return;
    }
    
    if (commands[cmd]) {
      const output = await commands[cmd](args);
      if (output) {
        addToHistory({ type: "output", text: output });
      }
    } else {
      addToHistory({
        type: "output",
        text: `Command not found: ${cmd}\nType 'help' for available commands.`,
      });
    }

    setInput("");
  };

  if (isLoading) {
    return (
      <div className="h-full bg-black p-4 font-mono text-sm text-white flex items-center justify-center">
        <div className="text-[#FECC00]">⚡ Loading file system...</div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="h-full bg-black p-4 font-mono text-sm text-white flex flex-col">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/20">
          <span className="text-[#FECC00]">nano: {editFilePath}</span>
          <span className="text-white/50 text-xs">Ctrl+S: Save | Ctrl+X: Exit</span>
        </div>
        <textarea
          ref={editTextareaRef}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleEditorKeyDown}
          className="flex-1 bg-transparent outline-none resize-none text-white font-mono text-sm"
          placeholder="Type your content..."
        />
      </div>
    );
  }

  return (
    <div
      className="h-full bg-black p-4 font-mono text-sm text-white"
      onClick={() => inputRef.current?.focus()}
      onMouseUp={handleMouseUp}
    >
      <div ref={scrollRef} className="h-full overflow-y-auto pb-4">
        {history.map((entry, i) => (
          <div key={i} className="mb-1">
            <HistoryEntryComponent entry={entry} />
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
          <span className="text-[#FECC00]">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white"
            autoFocus
            disabled={isAiLoading}
            placeholder={isAiLoading ? "AI is processing..." : "Type a command..."}
          />
          {isAiLoading && (
            <span className="text-[#FECC00] animate-pulse text-xs">⏳</span>
          )}
        </form>
      </div>
    </div>
  );
}