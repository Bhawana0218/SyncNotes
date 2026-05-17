import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { noteId } = body;

    if (!noteId) {
      return Response.json({ error: "Missing noteId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    const existing = await prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
    });

    if (!existing) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    // Reuse existing shareId if already shared
    const shareId = existing.shareId || uuid();

    const note = await prisma.note.update({
      where: { id: noteId },
      data: { isPublic: true, shareId },
    });

    return Response.json(note);
  } catch (error) {
    console.error("Share error:", error);
    return Response.json({ error: "Failed to share note" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { noteId } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
    });

    if (!existing) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    const note = await prisma.note.update({
      where: { id: noteId },
      data: { isPublic: false, shareId: null },
    });

    return Response.json(note);
  } catch (error) {
    console.error("Unshare error:", error);
    return Response.json({ error: "Failed to unshare note" }, { status: 500 });
  }
}
