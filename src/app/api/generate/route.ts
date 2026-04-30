import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchPosts } from "@/lib/search";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompt";

const anthropic = new Anthropic();

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
      model: "claude-opus-4-20250514",
      max_tokens: 1024,
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

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

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
