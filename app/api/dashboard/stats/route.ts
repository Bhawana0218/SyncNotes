import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, subDays, format } from "date-fns";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: {
      user: { email: session.user.email },
      archived: false,
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalNotes = notes.length;
  const aiGeneratedNotes = notes.filter((note) => note.summary).length;

  // Real weekly activity from DB
  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i);
    const dayName = weekDays[day.getDay()];
    const count = notes.filter((note) => {
      const noteDate = new Date(note.createdAt);
      return (
        noteDate.getFullYear() === day.getFullYear() &&
        noteDate.getMonth() === day.getMonth() &&
        noteDate.getDate() === day.getDate()
      );
    }).length;
    return { day: dayName, notes: count, date: format(day, "MMM d") };
  });

  // Most used tags
  const totalTags = notes.flatMap((note) => note.tags);
  const tagCounts: Record<string, number> = {};
  totalTags.forEach((tag) => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  const mostUsedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Weekly growth: compare this week vs last week
  const thisWeekStart = startOfWeek(today);
  const lastWeekStart = subDays(thisWeekStart, 7);
  const thisWeekNotes = notes.filter((n) => new Date(n.createdAt) >= thisWeekStart).length;
  const lastWeekNotes = notes.filter(
    (n) => new Date(n.createdAt) >= lastWeekStart && new Date(n.createdAt) < thisWeekStart
  ).length;
  const weeklyGrowth =
    lastWeekNotes === 0
      ? thisWeekNotes > 0
        ? 100
        : 0
      : Math.round(((thisWeekNotes - lastWeekNotes) / lastWeekNotes) * 100);

  // Productivity score based on AI usage
  const productivityScore =
    totalNotes === 0 ? 0 : Math.min(100, Math.round((aiGeneratedNotes / totalNotes) * 100));

  return Response.json({
    totalNotes,
    aiGeneratedNotes,
    mostUsedTags,
    recentNotes: notes.slice(0, 5),
    weeklyActivity,
    weeklyGrowth,
    productivityScore,
  });
}
