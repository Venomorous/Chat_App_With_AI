import { NextResponse, NextRequest } from "next/server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "../../../../../prisma";
import socket from "@/socket";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (req.method !== "POST") {
        return NextResponse.json(
            { error: "Method not allowed" },
            { status: 405 }
        );
    }

    if (!session || !session.user) {
        return NextResponse.json(
            { error: "User not authorized" },
            { status: 401 }
        );
    }

    try {
        const { message, image } = await req.json();

        const searchParams = req.nextUrl.searchParams;
        const chatId = searchParams.get("chatId");

        if (!chatId) {
            return NextResponse.json(
                { error: "Chat ID missing" },
                { status: 400 }
            );
        }

        if (!message) {
            return NextResponse.json(
                { error: "Message missing" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email: session?.user.email,
            },
            include: {
                conversations: true,
            },
        });

        //!------------------------------------------------------------------------------------------

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: chatId,
            },
            include: {
                messages: true, // Include messages in the conversation query
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (!conversation) {
            return NextResponse.json(
                { error: "Chat not found" },
                { status: 404 }
            );
        }

        const newMessage = await prisma.message.create({
            data: {
                body: message,
                image: image, // Assuming image is a variable containing the image URL
                conversation: {
                    connect: { id: conversation.id }, // Connect to existing conversation
                },
                sender: {
                    connect: { id: user.id }, // Connect to the user who sent the message
                },
            },
            include: {
                sender: true, // Include sender details
            },
        });

        const updatedConversation = await prisma.conversation.update({
            where: {
                id: chatId,
            },
            data: {
                messagesIds: {
                    push: newMessage.id,
                },
                lastMessageAt: new Date(),
                lastMessage: message,
                lastMessageSenderId: {
                    set: user.id,
                },
                lastMessageSeenIds: [],
            },
        });

        const updateUsers = await prisma.user.updateMany({
            where: {
                AND: [
                    {
                        conversationIds: {
                            has: chatId,
                        },
                    },
                    {
                        NOT: {
                            id: user.id,
                        },
                    },
                ],
            },
            data: {
                unreadMessagesIds: {
                    push: newMessage.id,
                },
            },
        });

        const channelKey = `chat:${chatId}:messages:api`;
        const chatChannelId = "chat:message:add";

        socket.emit(chatChannelId, {
            chatId: chatId,
            message: newMessage,
        });

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.log("[MESSAGES POST]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
