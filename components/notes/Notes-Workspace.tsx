"use client";

import { NotesSidebar } from "./Notes-Sidebar";
import { NotesEditor } from "./Notes-Editor";
import { AIInsightsPanel } from "./Ai-Insights-Panel";

export function NotesWorkspace() {
  return (
    <div className="h-full flex overflow-hidden">
      <NotesSidebar />

      <NotesEditor />

      <AIInsightsPanel />
    </div>
  );
}