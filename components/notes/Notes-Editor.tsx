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
  Bold, Italic, Underline as UnderlineIcon, Loader2, WandSparkles,
  Share2, Archive, Trash2, MoreHorizontal, FileText,
  Heading1, Heading2, List, ListOrdered, Quote, Code, Strikethrough, CheckSquare,
  CalendarPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShareModal } from "./Share-Modal";
import { ReminderDialog } from "@/components/calendar/Reminder-Dialog";
import { useNotesStore } from "@/store/use-notes-store";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const toolbarItems = [
  { key: "bold",        icon: Bold,         label: "Bold (Ctrl+B)",     action: (e: any) => e?.chain().focus().toggleBold().run(),                    isActive: (e: any) => e?.isActive("bold") },
  { key: "italic",      icon: Italic,       label: "Italic (Ctrl+I)",   action: (e: any) => e?.chain().focus().toggleItalic().run(),                  isActive: (e: any) => e?.isActive("italic") },
  { key: "underline",   icon: UnderlineIcon,label: "Underline",         action: (e: any) => e?.chain().focus().toggleUnderline().run(),               isActive: (e: any) => e?.isActive("underline") },
  { key: "strike",      icon: Strikethrough,label: "Strikethrough",     action: (e: any) => e?.chain().focus().toggleStrike().run(),                  isActive: (e: any) => e?.isActive("strike") },
  { key: "sep1",        icon: null,         label: "",                  action: null,                                                                  isActive: () => false },
  { key: "h1",          icon: Heading1,     label: "Heading 1",         action: (e: any) => e?.chain().focus().toggleHeading({ level: 1 }).run(),     isActive: (e: any) => e?.isActive("heading", { level: 1 }) },
  { key: "h2",          icon: Heading2,     label: "Heading 2",         action: (e: any) => e?.chain().focus().toggleHeading({ level: 2 }).run(),     isActive: (e: any) => e?.isActive("heading", { level: 2 }) },
  { key: "sep2",        icon: null,         label: "",                  action: null,                                                                  isActive: () => false },
  { key: "bullet",      icon: List,         label: "Bullet List",       action: (e: any) => e?.chain().focus().toggleBulletList().run(),              isActive: (e: any) => e?.isActive("bulletList") },
  { key: "ordered",     icon: ListOrdered,  label: "Numbered List",     action: (e: any) => e?.chain().focus().toggleOrderedList().run(),             isActive: (e: any) => e?.isActive("orderedList") },
  { key: "blockquote",  icon: Quote,        label: "Blockquote",        action: (e: any) => e?.chain().focus().toggleBlockquote().run(),              isActive: (e: any) => e?.isActive("blockquote") },
  { key: "code",        icon: Code,         label: "Inline Code",       action: (e: any) => e?.chain().focus().toggleCode().run(),                    isActive: (e: any) => e?.isActive("code") },
];

export function NotesEditor() {
  const [shareOpen, setShareOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { activeNote, notes, setNotes, updateActiveNote, setActiveNote } = useNotesStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your thoughts... Press Ctrl+J for AI insights" }),
      Underline,
      Highlight,
    ],
    immediatelyRender: false,
    content: activeNote?.content || "",
    editorProps: {
      attributes: {
        class: "min-h-[calc(100vh-200px)] outline-none px-8 md:px-16 py-8 max-w-none",
        style: "color: var(--text-primary); font-size: 1rem; line-height: 1.7;",
      },
    },
    onUpdate: ({ editor }) => {
      updateActiveNote({ content: editor.getHTML() });
    },
  });

  useEffect(() => {
    if (!editor || !activeNote) return;
    if (editor.getHTML() !== activeNote.content) {
      editor.commands.setContent(activeNote.content || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote?.id, editor]);

  useEffect(() => {
    if (!activeNote) return;
    const t = setTimeout(async () => {
      try {
        setSaving(true);
        await axios.patch(`/api/notes/${activeNote.id}`, {
          content: activeNote.content,
          title: activeNote.title,
        });
        setLastSaved(new Date());
      } catch { toast.error("Auto-save failed"); }
      finally { setSaving(false); }
    }, 1200);
    return () => clearTimeout(t);
  }, [activeNote?.content, activeNote?.title, activeNote?.id]);

  const generateAI = useCallback(async () => {
    if (!activeNote) return;
    const plain = activeNote.content?.replace(/<[^>]*>/g, " ").trim();
    if (!plain || plain.length < 10) { toast.error("Write some content first"); return; }
    try {
      updateActiveNote({ isGenerating: true });
      toast.loading("SyncNotes AI is analyzing...", { id: "ai" });
      const res = await axios.post("/api/ai/generate", { noteId: activeNote.id, content: activeNote.content });
      updateActiveNote({
        summary: res.data.summary,
        actionItems: res.data.actionItems,
        tags: res.data.tags,
        title: res.data.title,
        isGenerating: false,
      });
      setNotes(notes.map((n) =>
        n.id === activeNote.id
          ? { ...n, summary: res.data.summary, actionItems: res.data.actionItems, tags: res.data.tags, title: res.data.title }
          : n
      ));
      toast.success("AI insights generated!", { id: "ai" });
    } catch (err: any) {
      updateActiveNote({ isGenerating: false });
      toast.error(err?.response?.data?.error || "AI generation failed", { id: "ai" });
    }
  }, [activeNote, notes, setNotes, updateActiveNote]);

  async function archiveNote() {
    if (!activeNote) return;
    try {
      await axios.patch(`/api/notes/${activeNote.id}`, { archived: true });
      const rest = notes.filter((n) => n.id !== activeNote.id);
      setNotes(rest); setActiveNote(rest[0] || null);
      toast.success("Note archived");
    } catch { toast.error("Failed to archive"); }
  }

  async function deleteNote() {
    if (!activeNote) return;
    try {
      await axios.delete(`/api/notes/${activeNote.id}`);
      const rest = notes.filter((n) => n.id !== activeNote.id);
      setNotes(rest); setActiveNote(rest[0] || null);
      toast.success("Note deleted");
    } catch { toast.error("Failed to delete"); }
  }

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "j") { e.preventDefault(); generateAI(); } };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [generateAI]);

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8"
        style={{ background: "var(--background)" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 mx-auto"
            style={{ background: "var(--surface-3)" }}>
            <FileText className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No note selected</h2>
          <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>
            Select a note from the sidebar or create a new one.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ShareModal open={shareOpen} onOpenChange={setShareOpen} noteId={activeNote.id} />
      <ReminderDialog open={reminderOpen} onOpenChange={setReminderOpen} defaultDate={new Date()} />

      <div className="flex-1 overflow-y-auto flex flex-col" style={{ background: "var(--background)" }}>
        {/* Toolbar */}
        <div className="sticky top-0 z-50 border-b"
          style={{ background: "color-mix(in srgb, var(--sidebar-bg) 92%, transparent)", borderColor: "var(--border)", backdropFilter: "blur(16px)" }}>

          {/* Title row */}
          <div className="flex items-center gap-3 px-4 md:px-6 h-14 border-b" style={{ borderColor: "var(--border)" }}>
            <input
              value={activeNote.title}
              onChange={(e) => updateActiveNote({ title: e.target.value })}
              className="bg-transparent text-xl font-bold outline-none flex-1 min-w-0 truncate"
              style={{ color: "var(--text-primary)" }}
              placeholder="Untitled Note"
            />

            <div className="flex items-center gap-2 shrink-0">
              <AnimatePresence mode="wait">
                {saving ? (
                  <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Loader2 className="w-3 h-3 animate-spin" />Saving...
                  </motion.span>
                ) : lastSaved ? (
                  <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-xs" style={{ color: "var(--text-muted)" }}>Saved</motion.span>
                ) : null}
              </AnimatePresence>

              {/* Tags badges */}
              {activeNote.tags && activeNote.tags.length > 0 && (
                <div className="hidden md:flex items-center gap-1">
                  {activeNote.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] h-5 px-2 rounded-full border-0"
                      style={{ background: "var(--accent)", color: "var(--primary-light)" }}>
                      #{tag}
                    </Badge>
                  ))}
                  {activeNote.tags.length > 2 && (
                    <Badge variant="outline" className="text-[10px] h-5 px-2 rounded-full border-0"
                      style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}>
                      +{activeNote.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setReminderOpen(true)}
                    className="hidden sm:flex w-8 h-8 rounded-xl items-center justify-center transition"
                    style={{ background: "var(--surface-3)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                    <CalendarPlus className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Add Reminder</TooltipContent>
              </Tooltip>

              <button onClick={() => setShareOpen(true)}
                className="hidden sm:flex px-3 h-8 rounded-xl items-center gap-1.5 text-sm transition"
                style={{ background: "var(--surface-3)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                <Share2 className="w-3.5 h-3.5" />Share
              </button>

              <Button onClick={generateAI} disabled={activeNote.isGenerating}
                className="h-8 px-4 rounded-xl flex items-center gap-1.5 font-semibold text-sm border-0 hover:opacity-90"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                {activeNote.isGenerating
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span className="hidden sm:inline">Thinking...</span></>
                  : <><WandSparkles className="w-3.5 h-3.5" /><span className="hidden sm:inline">AI Generate</span></>}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                    style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl shadow-xl"
                  style={{ background: "var(--popover)", borderColor: "var(--border)", color: "var(--text-primary)" }}>
                  <DropdownMenuItem onClick={() => setShareOpen(true)} className="flex items-center gap-2 cursor-pointer sm:hidden">
                    <Share2 className="w-4 h-4" />Share Note
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setReminderOpen(true)} className="flex items-center gap-2 cursor-pointer sm:hidden">
                    <CalendarPlus className="w-4 h-4" />Add Reminder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={archiveNote} className="flex items-center gap-2 cursor-pointer">
                    <Archive className="w-4 h-4" />Archive Note
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ background: "var(--border)" }} />
                  <DropdownMenuItem onClick={deleteNote} className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500">
                    <Trash2 className="w-4 h-4" />Delete Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Format toolbar */}
          <div className="flex items-center gap-0.5 px-4 md:px-6 h-10 overflow-x-auto scrollbar-hide">
            {toolbarItems.map((item) => {
              if (item.icon === null) {
                return <div key={item.key} className="w-px h-4 mx-1 shrink-0" style={{ background: "var(--border)" }} />;
              }
              const Icon = item.icon;
              const active = item.isActive(editor);
              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <button onClick={() => item.action?.(editor)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0"
                      style={active
                        ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                        : { color: "var(--text-muted)" }
                      }
                      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--surface-3)"; }}
                      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
            <div className="ml-auto hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs shrink-0"
              style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}>
              <CheckSquare className="w-3 h-3" style={{ color: "var(--primary-light)" }} />Ctrl+J for AI
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <EditorContent editor={editor} />
        </div>
      </div>
    </TooltipProvider>
  );
}
