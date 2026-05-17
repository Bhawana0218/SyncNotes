import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "2026-05" format
  const upcoming = searchParams.get("upcoming") === "true";

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  let where: any = { userId: user.id };

  if (month) {
    const [year, m] = month.split("-").map(Number);
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 1);
    where.date = { gte: start, lt: end };
  }

  if (upcoming) {
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    where.date = { gte: now, lte: weekAhead };
    where.completed = false;
  }

  const reminders = await prisma.reminder.findMany({
    where,
    orderBy: { date: "asc" },
    include: { note: { select: { id: true, title: true } } },
  });

  return Response.json(reminders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, date, type, color, noteId } = body;

  if (!title || !date) {
    return Response.json({ error: "Title and date are required" }, { status: 400 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      title: String(title).slice(0, 200),
      description: description ? String(description).slice(0, 1000) : null,
      date: new Date(date),
      type: type || "reminder",
      color: color || "#7c3aed",
      userId: user.id,
      noteId: noteId || null,
    },
    include: { note: { select: { id: true, title: true } } },
  });

  return Response.json(reminder, { status: 201 });
}
