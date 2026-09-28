import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchPosts } from "@/lib/search";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompt";

const anthropic = new Anthropic();

// Opus 5 at max effort thinks before it writes; allow Vercel's 300 s ceiling.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, details, insideJokes, tags, intensity } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const searchQuery = [name, details, insideJokes, ...(tags || [])].join(" ");
    const matches = searchPosts(searchQuery, tags || [], intensity || 5, 15);
    const matchedTexts = matches.map((m) => m.text);

    const message = await anthropic.messages.create({
      model: "claude-opus-5",
      // Thinking counts against max_tokens. 16K keeps the SDK under its non-streaming limit.
      max_tokens: 16000,
      // Opus 5 rejects temperature; effort is the only creativity knob, max is its top.
      output_config: { effort: "max" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserMessage(
            name,
            details || "",
            insideJokes || "",
            tags || [],
            intensity || 5,
            matchedTexts
          ),
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";
    if (!text) {
      return NextResponse.json(
        { error: `No roast came back (stop_reason: ${message.stop_reason}). Try again.` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      text,
      matches: matches.slice(0, 5).map((m) => ({
        text: m.text.slice(0, 200),
        nickname: m.nickname,
        insult_type: m.insult_type,
      })),
    });
  } catch (err: unknown) {
    console.error("Generate error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
