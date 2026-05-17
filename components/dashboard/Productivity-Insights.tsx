"use client";

import { motion } from "framer-motion";

import {
  BrainCircuit,
  Flame,
  FileText,
  Sparkles,
  Calendar,
  Tag,
  TrendingUp,
} from "lucide-react";

interface ProductivityInsightsProps {
  notes: any[];
  aiGeneratedNotes: number;
  totalNotes: number;
  mostUsedTags: [string, number][];
}

function calculateWordCount(notes: any[]) {
  return notes.reduce((acc, note) => {
    const text =
      note.content
        ?.replace(/<[^>]*>/g, "")
        ?.trim() || "";

    return (
      acc +
      text.split(/\s+/).filter(Boolean)
        .length
    );
  }, 0);
}

function getMostProductiveDay(notes: any[]) {
  const days: Record<string, number> = {};

  notes.forEach((note) => {
    const day = new Date(
      note.createdAt
    ).toLocaleDateString("en-US", {
      weekday: "long",
    });

    days[day] = (days[day] || 0) + 1;
  });

  return (
    Object.entries(days).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "N/A"
  );
}

function getWeeklyNotes(notes: any[]) {
  const now = new Date();

  const weekAgo = new Date();

  weekAgo.setDate(now.getDate() - 7);

  return notes.filter(
    (note) =>
      new Date(note.createdAt) >=
      weekAgo
  ).length;
}

function getWritingStreak(notes: any[]) {
  const uniqueDays = new Set(
    notes.map((note) =>
      new Date(note.createdAt).toDateString()
    )
  );

  return uniqueDays.size;
}

export function ProductivityInsights({
  notes,
  aiGeneratedNotes,
  totalNotes,
  mostUsedTags,
}: ProductivityInsightsProps) {
  const totalWords =
    calculateWordCount(notes);

  const aiRate =
    totalNotes > 0
      ? Math.round(
          (aiGeneratedNotes /
            totalNotes) *
            100
        )
      : 0;

  const insights = [
    {
      label: "Total Words",
      value:
        totalWords.toLocaleString(),
      icon: FileText,
    },
    {
      label: "AI Adoption",
      value: `${aiRate}%`,
      icon: Sparkles,
    },
    {
      label: "Most Productive Day",
      value: getMostProductiveDay(
        notes
      ),
      icon: Calendar,
    },
    {
      label: "Writing Streak",
      value: `${getWritingStreak(
        notes
      )} days`,
      icon: Flame,
    },
    {
      label: "Weekly Notes",
      value: getWeeklyNotes(notes),
      icon: TrendingUp,
    },
    {
      label: "Top Tag",
      value:
        mostUsedTags?.[0]?.[0] || "N/A",
      icon: Tag,
    },
  ];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay: 0.5,
      }}
      className="rounded-2xl p-6"
      style={{
        background:
          "var(--surface-1)",
        border:
          "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background:
              "var(--accent)",
          }}
        >
          <BrainCircuit
            className="w-5 h-5"
            style={{
              color:
                "var(--primary-light)",
            }}
          />
        </div>

        <div>
          <h2
            className="text-lg font-bold"
            style={{
              color:
                "var(--text-primary)",
            }}
          >
            Productivity Insights
          </h2>

          <p
            className="text-xs"
            style={{
              color:
                "var(--text-muted)",
            }}
          >
            AI-generated workspace intelligence
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {insights.map(
          (item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    0.6 +
                    index * 0.05,
                }}
                className="rounded-xl p-4"
                style={{
                  background:
                    "var(--surface-2)",
                  border:
                    "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon
                    className="w-4 h-4"
                    style={{
                      color:
                        "var(--primary-light)",
                    }}
                  />

                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background:
                        "var(--primary)",
                    }}
                  />
                </div>

                <h3
                  className="text-2xl font-bold"
                  style={{
                    color:
                      "var(--text-primary)",
                  }}
                >
                  {item.value}
                </h3>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      "var(--text-muted)",
                  }}
                >
                  {item.label}
                </p>
              </motion.div>
            );
          }
        )}
      </div>
    </motion.div>
  );
}