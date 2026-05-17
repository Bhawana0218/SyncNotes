import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { Sparkles, Globe, ArrowLeft, Tag, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  const { shareId } = await params;

  const note = await prisma.note.findFirst({
    where: { shareId, isPublic: true },
    include: { user: { select: { name: true } } },
  });

  if (!note) {
    return {
      title: "Note Not Found — SyncNotes",
      description: "This shared note does not exist or has been removed.",
    };
  }

  return {
    title: `${note.title} — SyncNotes`,
    description: note.summary || `Shared note by ${note.user?.name || "a SyncNotes user"}`,
    openGraph: {
      title: note.title,
      description: note.summary || "Shared via SyncNotes AI",
      type: "article",
    },
  };
}

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const note = await prisma.note.findFirst({
    where: { shareId, isPublic: true },
    include: { user: { select: { name: true, image: true } } },
  });

  if (!note) {
    notFound();
  }

  let actionItems: string[] = [];
  try {
    actionItems = note.actionItems ? JSON.parse(note.actionItems) : [];
  } catch {
    actionItems = [];
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto h-16 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none">SyncNotes</h1>
              <p className="text-[10px] text-zinc-500 leading-none mt-0.5">AI Workspace</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
              <Globe className="w-3.5 h-3.5" />
              Public Note
            </div>
            <Link
              href="/register"
              className="px-4 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:scale-[1.02] transition"
            >
              Try SyncNotes
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to SyncNotes
        </Link>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">{note.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            {note.user?.name && (
              <span>Shared by {note.user.name}</span>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {note.tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Note content */}
        <div
          className="prose prose-invert max-w-none text-zinc-200 prose-headings:font-bold prose-p:leading-relaxed prose-code:text-zinc-300 prose-blockquote:border-zinc-700 prose-blockquote:text-zinc-400 mb-12"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />

        {/* AI Insights */}
        {(note.summary || actionItems.length > 0) && (
          <div className="space-y-4 border-t border-zinc-900 pt-10">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-zinc-400" />
              <h2 className="text-xl font-bold">AI Insights</h2>
            </div>

            {note.summary && (
              <div className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
                  Summary
                </h3>
                <p className="text-zinc-300 leading-relaxed">{note.summary}</p>
              </div>
            )}

            {actionItems.length > 0 && (
              <div className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6">
                <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
                  Action Items
                </h3>
                <div className="space-y-3">
                  {actionItems.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0" />
                      <p className="text-zinc-300 text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-xl font-bold mb-2">Create your own AI workspace</h3>
          <p className="text-zinc-500 text-sm mb-5">
            SyncNotes helps you capture, organize, and act on your ideas with AI.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-semibold hover:scale-[1.02] transition text-sm"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </main>
  );
}
