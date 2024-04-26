import { NextResponse, NextRequest } from "next/server";
import prisma from "../../../../../../prisma";
import getUserFromSession from "@/lib/getUserSession";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromSession(req);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const conversation = await prisma.conversation.delete({
            where: {
                id: params.id,
            },
        });

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("Error fetching user chats:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching user chats" },
            { status: 500 }
        );
    }
}
