import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma";
import getUserFromSession from "@/lib/getUserSession";

export async function GET(req: NextRequest) {
    try {
        // const { chatId } = req.query; // Extract chatId from query parameterss
        const searchParams = req.nextUrl.searchParams;
        const chatId = searchParams.get("chatId");
        const user = await getUserFromSession(req);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // console.log("ChatId:", chatId);
        const chat = await prisma.conversation.findUnique({
            where: {
                id: chatId as string,
            },
            include: {
                messages: {
                    include: {
                        sender: true,
                    },
                },
                users: true,
            },
        });

        if (!chat) {
            return NextResponse.json(
                { error: "Chat not found" },
                { status: 404 }
            );
        }

        // console.log(chat.messages);

        const messages = chat.messages;

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching user chats:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching user chats" },
            { status: 500 }
        );
    }
}
