import { NextResponse, NextRequest } from "next/server";
import prisma from "../../../../../../prisma";
import getUserFromSession from "@/lib/getUserSession";
import { Message, User } from "@/lib/my-types";
import socket from "@/socket";
import { error } from "console";
// import { useSocket } from "@/components/providers/socket-provider";

export async function POST(
    req: NextRequest,
    { params }: { params: { messageId: string } }
) {
    const user: User | NextResponse = await getUserFromSession(req);

    if (user instanceof NextResponse) {
        return user;
    }

    // const { socket } = useSocket();
    // console.log("Message:", params.messageId);

    const message = await prisma.message.findUnique({
        where: {
            id: params.messageId,
        },
    });

    // console.log("Retrieved Message:", message);

    let updatedMessage = message;

    if (!message) {
        return NextResponse.json(
            { error: "Message not found" },
            { status: 404 }
        );
    }

    if (!message.seenIds.includes(user.id)) {
        updatedMessage = await prisma.message.update({
            where: {
                id: params.messageId,
            },
            data: {
                seenIds: {
                    push: user.id,
                },
            },
        });

        const updatedConversation = await prisma.conversation.update({
            where: {
                id: updatedMessage.conversationId,
            },
            data: {
                lastMessageSeenIds: {
                    push: user.id,
                },
            },
        });

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                unreadMessagesIds: {
                    set: user.unreadMessagesIds.filter(
                        (messageId) =>
                            !updatedConversation.messagesIds.includes(messageId)
                    ),
                },
            },
        });

        // console.log(params.messageId);
        socket?.emit("message:seen", {
            messageId: params.messageId,
            userIds: updatedMessage.seenIds,
        });
    } else {
        // console.log("Message already seen");
    }

    // console.log("Message seen:", updatedMessage);

    return NextResponse.json(updatedMessage, { status: 201 });
}
