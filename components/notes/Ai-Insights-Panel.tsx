"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Tag,
  BrainCircuit,
  WandSparkles,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNotesStore } from "@/store/use-notes-store";

export function AIInsightsPanel() {
  const { activeNote } = useNotesStore();
  const [copiedSummary, setCopiedSummary] = useState(false);

  let actionItems: string[] = [];
  try {
    actionItems = activeNote?.actionItems ? JSON.parse(activeNote.actionItems) : [];
  } catch {
    actionItems = [];
  }

  const hasInsights = activeNote?.summary || actionItems.length > 0 || (activeNote?.tags?.length ?? 0) > 0;

  async function copySummary() {
    if (!activeNote?.summary) return;
    await navigator.clipboard.writeText(activeNote.summary);
    setCopiedSummary(true);
    toast.success("Summary copied");
    setTimeout(() => setCopiedSummary(false), 2000);
  }

  return (
    <aside className="hidden xl:flex w-80 2xl:w-96 border-l border-zinc-900 bg-zinc-950/50 flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Workspace</h2>
            <p className="text-xs text-zinc-500">Intelligent note analysis</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!activeNote ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center mb-4">
              <BrainCircuit className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-500">Select a note to see AI insights</p>
          </motion.div>
        ) : activeNote.isGenerating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
            </div>
            <p className="text-sm font-medium text-white">Analyzing your note...</p>
            <p className="text-xs text-zinc-500 mt-1">AI is generating insights</p>
          </motion.div>
        ) : !hasInsights ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center mb-4">
              <WandSparkles className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-white">No insights yet</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-[180px]">
              Press ⌘J or click AI Generate to analyze this note
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {/* Summary */}
            {activeNote.summary && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-zinc-900 bg-zinc-900/50 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <h3 className="text-sm font-semibold">AI Summary</h3>
                  </div>
                  <button
                    onClick={copySummary}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition"
                  >
                    {copiedSummary ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{activeNote.summary}</p>
              </motion.div>
            )}

            {/* Action Items */}
            {actionItems.length > 0 && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-zinc-900 bg-zinc-900/50 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                  <h3 className="text-sm font-semibold">Action Items</h3>
                  <span className="ml-auto text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {actionItems.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {actionItems.map((item: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-2.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                      <p className="text-xs text-zinc-300 leading-relaxed">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Smart Tags */}
            {(activeNote?.tags?.length ?? 0) > 0 && (
              <motion.div
                key="tags"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-zinc-900 bg-zinc-900/50 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4" />
                  <h3 className="text-sm font-semibold">Smart Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeNote.tags.map((tag) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-2.5 py-1 rounded-full bg-black border border-zinc-800 text-xs text-zinc-300 hover:border-zinc-600 transition cursor-default"
                    >
                      #{tag}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-4 border-t border-zinc-900">
        <div className="rounded-xl bg-zinc-900/50 p-3 text-center">
          <p className="text-xs text-zinc-600">
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">⌘J</kbd> to generate AI insights
          </p>
        </div>
      </div>
    </aside>
  );
}
