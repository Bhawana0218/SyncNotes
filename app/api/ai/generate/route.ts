import { auth } from "@/auth";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { buildPrompt } from "@/lib/ai-prompts";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId, content } = await req.json();

    if (!noteId || typeof content !== "string") {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

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

    const plainText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (plainText.length < 10) {
      return Response.json(
        { error: "Note too short for AI analysis" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON generator. Return ONLY valid JSON. No markdown, no backticks.",
        },
        {
          role: "user",
          content: buildPrompt(plainText) + "\n\nIMPORTANT: Return ONLY JSON.",
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800,
    });

    let raw = completion.choices[0]?.message?.content;

    if (!raw) {
      return Response.json({ error: "Empty AI response" }, { status: 500 });
    }

    
    let parsed;
    try {
      raw = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("AI JSON PARSE ERROR:", raw);
      return Response.json(
        { error: "Invalid AI JSON response", raw },
        { status: 500 }
      );
    }

    // Validate expected fields exist in parsed response
    if (!parsed.summary || !Array.isArray(parsed.actionItems) || !Array.isArray(parsed.tags)) {
      console.error("AI response missing required fields:", parsed);
      return Response.json(
        { error: "AI response missing required fields", raw: parsed },
        { status: 500 }
      );
    }

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        summary: parsed.summary ?? "",
        actionItems: JSON.stringify(parsed.actionItems ?? []),
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        title: parsed.suggestedTitle ?? note.title,
      },
    });

    // Return the note with the updated title field explicitly mapped
    return Response.json({
      ...updatedNote,
      title: updatedNote.title,
    });
  } catch (error: any) {
    console.error("AI generation error:", error?.message || error);
    return Response.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}