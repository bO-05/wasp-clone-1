"use client";

import { useState, useEffect } from "react";
import { Folder, FileText, ChevronRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface FileNode {
  id?: number;
  name: string;
  path: string;
  type: "file" | "directory";
  content?: string;
  user_id?: string;
}

export default function FilesApp() {
  const { data: session } = useSession();
  const [currentPath, setCurrentPath] = useState("/home");
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  // Load files from database or localStorage
  useEffect(() => {
    const loadFiles = async () => {
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
            setFiles(data.files || []);
          }
        } catch (error) {
          console.error("Failed to load files:", error);
        }
      } else {
        try {
          const saved = localStorage.getItem("terminal-files");
          if (saved) {
            setFiles(JSON.parse(saved));
          }
        } catch (e) {
          console.error("Failed to load localStorage files", e);
        }
      }
      setIsLoading(false);
    };
    
    loadFiles();
  }, [session?.user?.id]);

  const getChildrenOfPath = (path: string): FileNode[] => {
    return files.filter(f => {
      if (f.path === path) return false;
      const parentPath = f.path.substring(0, f.path.lastIndexOf("/")) || "/";
      return parentPath === path;
    });
  };

  const navigate = (file: FileNode) => {
    if (file.type === "directory") {
      setCurrentPath(file.path);
      setSelectedFile(null);
    } else {
      // File clicked - show content
      setSelectedFile(file);
    }
  };

  const goBack = () => {
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/")) || "/home";
    setCurrentPath(parentPath);
    setSelectedFile(null);
  };

  const getCurrentFiles = (): FileNode[] => {
    return getChildrenOfPath(currentPath);
  };

  const getBreadcrumbs = () => {
    if (currentPath === "/home") return ["home"];
    const parts = currentPath.split("/").filter(Boolean);
    return parts;
  };

  if (isLoading) {
    return (
      <div className="h-full bg-black p-6 flex items-center justify-center">
        <div className="text-[#FECC00]">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex">
      {/* File List */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-2 text-sm">
          <button
            onClick={() => {
              setCurrentPath("/home");
              setSelectedFile(null);
            }}
            className="text-[#FECC00] hover:underline font-bold"
          >
            Home
          </button>
          {getBreadcrumbs().slice(1).map((segment, i) => {
            const path = "/" + getBreadcrumbs().slice(0, i + 2).join("/");
            return (
              <div key={i} className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-white/50" />
                <button
                  onClick={() => {
                    setCurrentPath(path);
                    setSelectedFile(null);
                  }}
                  className="text-[#FECC00] hover:underline"
                >
                  {segment}
                </button>
              </div>
            );
          })}
        </div>

        {/* File List */}
        <div className="space-y-1">
          {currentPath !== "/home" && (
            <button
              onClick={goBack}
              className="flex w-full items-center gap-2 border border-transparent px-3 py-2 text-left text-sm transition-all hover:border-white/20 hover:bg-white/5"
            >
              <Folder className="h-4 w-4 text-[#FECC00]" />
              <span className="text-white">..</span>
            </button>
          )}
          
          {getCurrentFiles().length === 0 ? (
            <div className="py-8 text-center text-sm text-white/50">
              This folder is empty
            </div>
          ) : (
            getCurrentFiles().map((node) => (
              <button
                key={node.path}
                onClick={() => navigate(node)}
                className={`flex w-full items-center gap-2 border px-3 py-2 text-left text-sm transition-all hover:border-white/20 hover:bg-white/5 ${
                  selectedFile?.path === node.path
                    ? "border-[#FECC00] bg-[#FECC00]/10"
                    : "border-transparent"
                }`}
              >
                {node.type === "directory" ? (
                  <Folder className="h-4 w-4 text-[#FECC00]" />
                ) : (
                  <FileText className="h-4 w-4 text-white/50" />
                )}
                <span className="text-white">{node.name}</span>
                {node.type === "file" && (
                  <span className="ml-auto text-xs text-white/40">
                    {(node.content?.length || 0)} bytes
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* File Preview Panel */}
      {selectedFile && (
        <div className="w-[400px] border-l border-white/10 bg-black/50 p-6 overflow-y-auto">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-[#FECC00]" />
              <h3 className="font-bold text-white">{selectedFile.name}</h3>
            </div>
            <div className="text-xs text-white/50">
              <div>Type: {selectedFile.type}</div>
              <div>Size: {(selectedFile.content?.length || 0)} bytes</div>
              <div>Path: {selectedFile.path}</div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h4 className="mb-2 text-xs font-bold uppercase text-white/70">Content</h4>
            {selectedFile.content ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-white/80 bg-black/50 p-3 border border-white/10">
                {selectedFile.content}
              </pre>
            ) : (
              <div className="text-sm text-white/50 italic">Empty file</div>
            )}
          </div>

          <div className="mt-4 p-3 border border-white/10 bg-[#FECC00]/5">
            <div className="text-xs text-white/70">
              💡 Tip: You can edit files in the Terminal app using commands like:
              <div className="mt-2 font-mono text-[#FECC00]">
                $ cat {selectedFile.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}