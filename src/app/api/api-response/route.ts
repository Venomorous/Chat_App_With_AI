import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Anthropic from "@anthropic-ai/sdk";

function formatChatHistory(messages: any) {
    return messages
        .map((msg: any, index: any) => `${msg.sender.name}: ${msg.body}`)
        .join("\n");
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json(
            { error: "User not authorized" },
            { status: 401 }
        );
    }

    const body = await req.json();
    if (!body.messages) {
        return NextResponse.json(
            { error: "Messages are missing" },
            { status: 400 }
        );
    }
    if (!body.user) {
        return NextResponse.json({ error: "User is missing" }, { status: 400 });
    }

    const user = body.user;
    const lastTenMessages = body.messages;

    const anthropic = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY,
    });

    const chatHistory = formatChatHistory(lastTenMessages);

    const prompt = `Act as a person that chats with another person. You are a ${user}, so answer from his point of view. Generate a response for the user with such chat history:\n${chatHistory}`;

    const message = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
    });
    console.log(message);
    return NextResponse.json({ message });
}
