"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, FileText, Save } from "lucide-react";
import { useClipboard } from "../clipboard-context";
import { useSession } from "@/lib/auth-client";

interface Note {
  id?: number;
  name: string;
  path: string;
  content: string;
}

export default function NotesApp() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNotePath, setSelectedNotePath] = useState<string | null>(null); // Track by path instead of object
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newNoteName, setNewNoteName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Note | null>(null);
  const { copy, paste } = useClipboard();
  const loadingRef = useRef(false); // Prevent concurrent loads

  const NOTES_DIR = "/home/notes";

  // Get selected note from current notes array
  const selectedNote = selectedNotePath ? notes.find(n => n.path === selectedNotePath) : null;

  // Load all notes from terminal file system
  const loadNotes = async () => {
    if (loadingRef.current) return; // Prevent concurrent loads
    loadingRef.current = true;
    
    try {
      if (session?.user?.id) {
        try {
          const token = localStorage.getItem("bearer_token");
          const response = await fetch("/api/desktop/files", {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.ok) {
            const data = await response.json();
            const noteFiles = data.filter((f: any) => 
              f.path.startsWith(NOTES_DIR) && 
              f.type === "file" &&
              f.name.endsWith(".txt")
            ) || [];
            
            setNotes(noteFiles);
            
            // If we have a selected path, update the content from the reloaded notes
            if (selectedNotePath) {
              const updatedNote = noteFiles.find((n: Note) => n.path === selectedNotePath);
              if (updatedNote && !isSaving) {
                // Only update content if not currently saving (to avoid overwriting user edits)
                setEditContent(updatedNote.content || "");
              }
            } else if (noteFiles.length > 0) {
              // No selection yet, select first note
              setSelectedNotePath(noteFiles[0].path);
              setEditContent(noteFiles[0].content || "");
            }
          }
        } catch (error) {
          console.error("Failed to load notes:", error);
        }
      } else {
        try {
          const saved = localStorage.getItem("terminal-files");
          if (saved) {
            const files = JSON.parse(saved);
            const noteFiles = files.filter((f: any) => 
              f.path.startsWith(NOTES_DIR) && 
              f.type === "file" &&
              f.name.endsWith(".txt")
            );
            
            setNotes(noteFiles);
            
            // If we have a selected path, update the content from the reloaded notes
            if (selectedNotePath) {
              const updatedNote = noteFiles.find((n: Note) => n.path === selectedNotePath);
              if (updatedNote && !isSaving) {
                setEditContent(updatedNote.content || "");
              }
            } else if (noteFiles.length > 0) {
              // No selection yet, select first note
              setSelectedNotePath(noteFiles[0].path);
              setEditContent(noteFiles[0].content || "");
            }
          }
        } catch (e) {
          console.error("Failed to load localStorage notes", e);
        }
      }
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [session?.user?.id]);

  // Auto-reload every 2 seconds to sync with terminal
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotes();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [session?.user?.id, selectedNotePath, isSaving]);

  // Save current note
  const saveNote = async () => {
    if (!selectedNote) return;
    
    setIsSaving(true);
    try {
      if (session?.user?.id) {
        const token = localStorage.getItem("bearer_token");
        
        if (selectedNote.id) {
          await fetch(`/api/desktop/files/${selectedNote.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: editContent }),
          });
        } else {
          const response = await fetch("/api/desktop/files", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: selectedNote.name,
              path: selectedNote.path,
              type: "file",
              content: editContent,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            // Update the note ID after creation
            setNotes(prev => prev.map(n => 
              n.path === selectedNote.path ? { ...n, id: data.id } : n
            ));
          }
        }
      } else {
        const saved = localStorage.getItem("terminal-files");
        const files = saved ? JSON.parse(saved) : [];
        const fileIndex = files.findIndex((f: any) => f.path === selectedNote.path);
        
        if (fileIndex !== -1) {
          files[fileIndex].content = editContent;
        } else {
          files.push({
            name: selectedNote.name,
            path: selectedNote.path,
            type: "file",
            content: editContent,
          });
        }
        
        localStorage.setItem("terminal-files", JSON.stringify(files));
      }
      
      // Update local state immediately
      setNotes(prev => prev.map(n => 
        n.path === selectedNote.path ? { ...n, content: editContent } : n
      ));
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save
  useEffect(() => {
    if (!selectedNote || isLoading) return;
    
    const timeout = setTimeout(() => {
      void saveNote();
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [editContent, selectedNotePath]);

  // Create new note
  const createNote = async () => {
    if (!newNoteName.trim()) return;
    
    const fileName = newNoteName.endsWith(".txt") ? newNoteName : `${newNoteName}.txt`;
    const newPath = `${NOTES_DIR}/${fileName}`;
    
    try {
      if (session?.user?.id) {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch("/api/desktop/files", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: fileName,
            path: newPath,
            type: "file",
            content: "",
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          await loadNotes();
          setSelectedNotePath(data.path);
          setEditContent("");
          setNewNoteName("");
          setIsCreating(false);
        }
      } else {
        const saved = localStorage.getItem("terminal-files");
        const files = saved ? JSON.parse(saved) : [];
        
        const newNote = {
          name: fileName,
          path: newPath,
          type: "file",
          content: "",
        };
        
        files.push(newNote);
        localStorage.setItem("terminal-files", JSON.stringify(files));
        
        await loadNotes();
        setSelectedNotePath(newPath);
        setEditContent("");
        setNewNoteName("");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  // Delete note
  const deleteNote = async (note: Note) => {
    try {
      if (session?.user?.id && note.id) {
        const token = localStorage.getItem("bearer_token");
        await fetch(`/api/desktop/files/${note.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const saved = localStorage.getItem("terminal-files");
        const files = saved ? JSON.parse(saved) : [];
        const filtered = files.filter((f: any) => f.path !== note.path);
        localStorage.setItem("terminal-files", JSON.stringify(filtered));
      }
      
      if (selectedNotePath === note.path) {
        setSelectedNotePath(null);
        setEditContent("");
      }
      
      await loadNotes();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (modKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      void saveNote();
      return;
    }

    if (modKey && e.key === 'c') {
      const textarea = e.currentTarget;
      const selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      );
      if (selectedText) {
        copy(selectedText);
      }
      return;
    }

    if (modKey && e.key === 'v') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const pastedText = paste();
      if (pastedText) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = editContent.substring(0, start) + pastedText + editContent.substring(end);
        setEditContent(newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + pastedText.length;
        }, 0);
      }
      return;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-black p-6 flex items-center justify-center">
        <div className="text-[#FECC00] font-mono text-sm">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex relative">
      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white/20 p-6 max-w-md w-full mx-4">
            <h3 className="text-white font-mono text-lg mb-2">Delete Note</h3>
            <p className="text-white/70 font-mono text-sm mb-6">
              Are you sure you want to delete "{deleteConfirm.name}"?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => deleteNote(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-mono text-sm hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-white/5 text-white font-mono text-sm hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-[#FECC00] text-black font-mono text-sm hover:bg-[#FECC00]/90 transition-colors"
          >
            <Plus size={16} />
            New Note
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {notes.length === 0 ? (
            <div className="text-white/40 font-mono text-xs p-4 text-center">
              No notes yet.
              <br />
              Create your first note!
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.path}
                className={`group flex items-center justify-between p-3 mb-1 cursor-pointer font-mono text-sm transition-colors ${
                  selectedNotePath === note.path
                    ? "bg-[#FECC00]/20 text-[#FECC00]"
                    : "text-white/70 hover:bg-white/5"
                }`}
                onClick={() => {
                  setSelectedNotePath(note.path);
                  setEditContent(note.content || "");
                }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText size={14} />
                  <span className="truncate">{note.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(note);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {isCreating ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <h3 className="text-white font-mono text-lg mb-4">Create New Note</h3>
              <input
                type="text"
                value={newNoteName}
                onChange={(e) => setNewNoteName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createNote();
                  if (e.key === "Escape") setIsCreating(false);
                }}
                placeholder="Enter note name..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white font-mono text-sm outline-none focus:border-[#FECC00] mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={createNote}
                  className="flex-1 px-4 py-2 bg-[#FECC00] text-black font-mono text-sm hover:bg-[#FECC00]/90"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewNoteName("");
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 text-white font-mono text-sm hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : selectedNote ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-[#FECC00]" />
                <span className="text-white font-mono text-sm">{selectedNote.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {isSaving && (
                  <div className="text-[#FECC00] font-mono text-xs flex items-center gap-2">
                    <Save size={12} />
                    Saving...
                  </div>
                )}
                {!isSaving && (
                  <div className="text-white/40 font-mono text-xs">
                    {selectedNote.path}
                  </div>
                )}
              </div>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start typing..."
              className="flex-1 p-6 bg-transparent font-mono text-sm text-white outline-none resize-none placeholder:text-white/30"
              autoFocus
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white/40 font-mono text-sm text-center">
              Select a note to edit
              <br />
              or create a new one
            </div>
          </div>
        )}
      </div>
    </div>
  );
}