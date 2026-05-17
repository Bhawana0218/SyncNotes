"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Loader2,
  WandSparkles,
  Share2,
  Archive,
  Trash2,
  MoreHorizontal,
  FileText,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Strikethrough,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ShareModal } from "./Share-Modal";
import { useNotesStore } from "@/store/use-notes-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotesEditor() {
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { activeNote, notes, setNotes, updateActiveNote, setActiveNote } = useNotesStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your thoughts... Press ⌘J for AI insights",
      }),
      Underline,
      Highlight,
    ],
    immediatelyRender: false,
    content: activeNote?.content || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[calc(100vh-200px)] outline-none px-8 md:px-16 py-8 prose prose-invert max-w-none prose-headings:font-bold prose-p:text-zinc-200 prose-strong:text-white prose-code:text-zinc-300 prose-blockquote:border-zinc-700 prose-blockquote:text-zinc-400",
      },
    },
    onUpdate: ({ editor }) => {
      updateActiveNote({ content: editor.getHTML() });
    },
  });

  // Sync editor content when active note changes
  useEffect(() => {
    if (!editor || !activeNote) return;
    const currentContent = editor.getHTML();
    if (currentContent !== activeNote.content) {
      editor.commands.setContent(activeNote.content || "");
    }
  // Only re-run when the active note ID changes, not on every content update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote?.id, editor]);

  // Auto-save with debounce
  useEffect(() => {
    if (!activeNote) return;

    const timeout = setTimeout(async () => {
      try {
        setSaving(true);
        await axios.patch(`/api/notes/${activeNote.id}`, {
          content: activeNote.content,
          title: activeNote.title,
        });
        setLastSaved(new Date());
      } catch {
        toast.error("Auto-save failed");
      } finally {
        setSaving(false);
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [activeNote?.content, activeNote?.title, activeNote?.id]);

  const generateAI = useCallback(async () => {
    if (!activeNote) return;

    const plainText = activeNote.content?.replace(/<[^>]*>/g, " ").trim();
    if (!plainText || plainText.length < 10) {
      toast.error("Write some content first before generating AI insights");
      return;
    }

    try {
      updateActiveNote({ isGenerating: true });
      toast.loading("SyncNotes AI is analyzing your note...", { id: "ai-loading" });

      const res = await axios.post("/api/ai/generate", {
        noteId: activeNote.id,
        content: activeNote.content,
      });

      updateActiveNote({
        summary: res.data.summary,
        actionItems: res.data.actionItems,
        tags: res.data.tags,
        title: res.data.title,
        isGenerating: false,
      });

      // Also update in notes list
      setNotes(
        notes.map((n) =>
          n.id === activeNote.id
            ? { ...n, summary: res.data.summary, tags: res.data.tags, title: res.data.title }
            : n
        )
      );

      toast.success("AI insights generated successfully", { id: "ai-loading" });
    } catch (error: any) {
      updateActiveNote({ isGenerating: false });
      const msg = error?.response?.data?.error || "AI generation failed";
      toast.error(msg, { id: "ai-loading" });
    }
  }, [activeNote, notes, setNotes, updateActiveNote]);

  async function archiveNote() {
    if (!activeNote) return;
    try {
      await axios.patch(`/api/notes/${activeNote.id}`, { archived: true });
      const remaining = notes.filter((n) => n.id !== activeNote.id);
      setNotes(remaining);
      setActiveNote(remaining[0] || null);
      toast.success("Note archived");
    } catch {
      toast.error("Failed to archive note");
    }
  }

  async function deleteNote() {
    if (!activeNote) return;
    try {
      await axios.delete(`/api/notes/${activeNote.id}`);
      const remaining = notes.filter((n) => n.id !== activeNote.id);
      setNotes(remaining);
      setActiveNote(remaining[0] || null);
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        generateAI();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [generateAI]);

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-24 h-24 rounded-3xl bg-zinc-900 flex items-center justify-center mb-6 mx-auto">
            <FileText className="w-12 h-12 text-zinc-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No note selected</h2>
          <p className="text-zinc-500 max-w-xs">
            Select a note from the sidebar or create a new one to get started.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <ShareModal open={shareOpen} onOpenChange={setShareOpen} noteId={activeNote.id} />

      <div className="flex-1 overflow-y-auto bg-[#090909] flex flex-col">
        {/* Toolbar */}
        <div className="sticky top-0 z-50 border-b border-zinc-900 bg-black/80 backdrop-blur-xl">
          {/* Title row */}
          <div className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-zinc-900/50">
            <input
              value={activeNote.title}
              onChange={(e) => updateActiveNote({ title: e.target.value })}
              className="bg-transparent text-xl font-bold outline-none flex-1 min-w-0 truncate"
              placeholder="Untitled Note"
            />

            <div className="flex items-center gap-2 shrink-0">
              {/* Save status */}
              <AnimatePresence mode="wait">
                {saving ? (
                  <motion.div
                    key="saving"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs text-zinc-500"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </motion.div>
                ) : lastSaved ? (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-zinc-600"
                  >
                    Saved
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <button
                onClick={() => setShareOpen(true)}
                className="hidden sm:flex px-3 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 items-center gap-1.5 text-sm transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>

              <Button
                onClick={generateAI}
                disabled={activeNote.isGenerating}
                className="h-8 px-4 rounded-xl bg-white text-black flex items-center gap-1.5 font-semibold text-sm hover:scale-[1.02] transition"
              >
                {activeNote.isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="hidden sm:inline">Thinking...</span>
                  </>
                ) : (
                  <>
                    <WandSparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">AI Generate</span>
                  </>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-zinc-950 border-zinc-800 text-white rounded-2xl"
                >
                  <DropdownMenuItem
                    onClick={() => setShareOpen(true)}
                    className="flex items-center gap-2 cursor-pointer sm:hidden"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Note
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={archiveNote}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Archive className="w-4 h-4" />
                    Archive Note
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={deleteNote}
                    className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Formatting toolbar */}
          <div className="flex items-center gap-1 px-4 md:px-6 h-10 overflow-x-auto scrollbar-hide">
            {[
              {
                icon: Bold,
                action: () => editor?.chain().focus().toggleBold().run(),
                active: editor?.isActive("bold"),
                title: "Bold",
              },
              {
                icon: Italic,
                action: () => editor?.chain().focus().toggleItalic().run(),
                active: editor?.isActive("italic"),
                title: "Italic",
              },
              {
                icon: UnderlineIcon,
                action: () => editor?.chain().focus().toggleUnderline().run(),
                active: editor?.isActive("underline"),
                title: "Underline",
              },
              {
                icon: Strikethrough,
                action: () => editor?.chain().focus().toggleStrike().run(),
                active: editor?.isActive("strike"),
                title: "Strikethrough",
              },
              null,
              {
                icon: Heading1,
                action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
                active: editor?.isActive("heading", { level: 1 }),
                title: "Heading 1",
              },
              {
                icon: Heading2,
                action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
                active: editor?.isActive("heading", { level: 2 }),
                title: "Heading 2",
              },
              null,
              {
                icon: List,
                action: () => editor?.chain().focus().toggleBulletList().run(),
                active: editor?.isActive("bulletList"),
                title: "Bullet List",
              },
              {
                icon: ListOrdered,
                action: () => editor?.chain().focus().toggleOrderedList().run(),
                active: editor?.isActive("orderedList"),
                title: "Ordered List",
              },
              {
                icon: Quote,
                action: () => editor?.chain().focus().toggleBlockquote().run(),
                active: editor?.isActive("blockquote"),
                title: "Quote",
              },
              {
                icon: Code,
                action: () => editor?.chain().focus().toggleCode().run(),
                active: editor?.isActive("code"),
                title: "Code",
              },
            ].map((item, i) => {
              if (item === null) {
                return <div key={`sep-${i}`} className="w-px h-4 bg-zinc-800 mx-1 shrink-0" />;
              }
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={item.action}
                  title={item.title}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 ${
                    item.active
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}

            <div className="ml-auto hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-xs text-zinc-500 shrink-0">
              <CheckSquare className="w-3 h-3" />
              ⌘J for AI
            </div>
          </div>
        </div>

        {/* Editor content */}
        <div className="flex-1">
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
}
