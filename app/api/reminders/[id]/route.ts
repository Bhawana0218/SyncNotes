import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.reminder.findFirst({ where: { id, userId: user.id } });
  if (!existing) return Response.json({ error: "Reminder not found" }, { status: 404 });

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if (body.title !== undefined) allowed.title = String(body.title).slice(0, 200);
  if (body.description !== undefined) allowed.description = body.description ? String(body.description).slice(0, 1000) : null;
  if (body.date !== undefined) allowed.date = new Date(body.date);
  if (body.type !== undefined) allowed.type = body.type;
  if (body.color !== undefined) allowed.color = body.color;
  if (body.completed !== undefined) allowed.completed = Boolean(body.completed);
  if (body.noteId !== undefined) allowed.noteId = body.noteId || null;

  const reminder = await prisma.reminder.update({
    where: { id },
    data: allowed,
    include: { note: { select: { id: true, title: true } } },
  });

  return Response.json(reminder);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.reminder.findFirst({ where: { id, userId: user.id } });
  if (!existing) return Response.json({ error: "Reminder not found" }, { status: 404 });

  await prisma.reminder.delete({ where: { id } });
  return Response.json({ success: true });
}
