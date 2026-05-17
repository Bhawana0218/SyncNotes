import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";
  const archived = searchParams.get("archived") === "true";

  const notes = await prisma.note.findMany({
    where: {
      user: { email: session.user.email },
      archived,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json(notes);
}

export async function POST() {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const note = await prisma.note.create({
    data: {
      title: "Untitled Note",
      content: "",
      tags: [],
      user: { connect: { email: session.user.email } },
    },
  });

  return Response.json(note);
}
