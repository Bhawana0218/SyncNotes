import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const note = await prisma.note.findFirst({
    where: { id, userId: user.id },
  });

  if (!note) {
    return Response.json({ error: "Note not found" }, { status: 404 });
  }

  return Response.json(note);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Verify ownership
  const existing = await prisma.note.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return Response.json({ error: "Note not found" }, { status: 404 });
  }

  const body = await req.json();

  // Whitelist allowed fields
  const allowedFields: Record<string, unknown> = {};
  if (body.title !== undefined) allowedFields.title = String(body.title).slice(0, 500);
  if (body.content !== undefined) allowedFields.content = body.content;
  if (body.tags !== undefined) allowedFields.tags = Array.isArray(body.tags) ? body.tags : [];
  if (body.archived !== undefined) allowedFields.archived = Boolean(body.archived);
  if (body.summary !== undefined) allowedFields.summary = body.summary;
  if (body.actionItems !== undefined) allowedFields.actionItems = body.actionItems;
  if (body.isPublic !== undefined) allowedFields.isPublic = Boolean(body.isPublic);

  const note = await prisma.note.update({
    where: { id },
    data: allowedFields,
  });

  return Response.json(note);
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Verify ownership before deleting
  const existing = await prisma.note.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return Response.json({ error: "Note not found" }, { status: 404 });
  }

  await prisma.note.delete({ where: { id } });

  return Response.json({ success: true });
}
