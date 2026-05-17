import { auth } from "@/auth";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { buildPrompt } from "@/lib/ai-prompts";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { noteId, content } = body;

    if (!content || typeof content !== "string") {
      return Response.json({ error: "Missing or invalid content" }, { status: 400 });
    }

    if (!noteId) {
      return Response.json({ error: "Missing noteId" }, { status: 400 });
    }

    // Verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
    });

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    // Strip HTML tags for AI processing
    const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    if (plainText.length < 10) {
      return Response.json({ error: "Note content is too short to analyze" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: buildPrompt(plainText),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;

    if (!response) {
      return Response.json({ error: "No AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(response);

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        summary: parsed.summary || null,
        actionItems: JSON.stringify(parsed.actionItems || []),
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 10) : [],
        title: parsed.suggestedTitle || note.title,
      },
    });

    return Response.json(updatedNote);
  } catch (error) {
    console.error("AI generation error:", error);
    return Response.json({ error: "AI generation failed" }, { status: 500 });
  }
}
