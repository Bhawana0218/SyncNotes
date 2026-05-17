"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Tag, BrainCircuit, WandSparkles, Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNotesStore } from "@/store/use-notes-store";

export function AIInsightsPanel() {
  const { activeNote } = useNotesStore();
  const [copiedSummary, setCopiedSummary] = useState(false);

  let actionItems: string[] = [];
  try { actionItems = activeNote?.actionItems ? JSON.parse(activeNote.actionItems) : []; }
  catch { actionItems = []; }

  const hasInsights = activeNote?.summary || actionItems.length > 0 || (activeNote?.tags?.length ?? 0) > 0;

  async function copySummary() {
    if (!activeNote?.summary) return;
    await navigator.clipboard.writeText(activeNote.summary);
    setCopiedSummary(true);
    toast.success("Summary copied");
    setTimeout(() => setCopiedSummary(false), 2000);
  }

  return (
    <aside className="hidden xl:flex w-80 2xl:w-96 flex-col overflow-hidden border-l"
      style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}>

      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "var(--primary)" }}>
            <BrainCircuit className="w-5 h-5" style={{ color: "var(--primary-foreground)" }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>AI Workspace</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Intelligent note analysis</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!activeNote ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--surface-3)" }}>
              <BrainCircuit className="w-7 h-7" style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select a note to see AI insights</p>
          </motion.div>

        ) : activeNote.isGenerating ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--accent)" }}>
              <Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--primary-light)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Analyzing your note...</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>AI is generating insights</p>
          </motion.div>

        ) : !hasInsights ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--surface-3)" }}>
              <WandSparkles className="w-7 h-7" style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No insights yet</p>
            <p className="text-xs mt-1 max-w-[160px]" style={{ color: "var(--text-muted)" }}>
              Press ⌘J or click AI Generate to analyze this note
            </p>
          </motion.div>

        ) : (
          <AnimatePresence>
            {/* Summary */}
            {activeNote.summary && (
              <motion.div key="summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: "var(--primary-light)" }} />
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>AI Summary</h3>
                  </div>
                  <button onClick={copySummary}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                    style={{ background: "var(--surface-3)" }}>
                    {copiedSummary
                      ? <Check className="w-3.5 h-3.5 text-green-500" />
                      : <Copy className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />}
                  </button>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {activeNote.summary}
                </p>
              </motion.div>
            )}

            {/* Action Items */}
            {actionItems.length > 0 && (
              <motion.div key="actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "var(--primary-light)" }} />
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Action Items</h3>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
                    {actionItems.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {actionItems.map((item: string, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: "var(--primary)" }} />
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tags */}
            {(activeNote?.tags?.length ?? 0) > 0 && (
              <motion.div key="tags" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4" style={{ color: "var(--primary-light)" }} />
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Smart Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeNote.tags.map((tag) => (
                    <motion.div key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      className="px-2.5 py-1 rounded-full text-xs font-medium cursor-default"
                      style={{ background: "var(--accent)", color: "var(--primary-light)", border: "1px solid var(--border)" }}>
                      #{tag}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-3)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded font-mono text-xs"
              style={{ background: "var(--surface-hover)", color: "var(--primary-light)" }}>⌘J</kbd>
            {" "}to generate AI insights
          </p>
        </div>
      </div>
    </aside>
  );
}
