import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "../../../../../prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json(
            { error: "User not authenticated" },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
            include: {
                conversations: {
                    orderBy: {
                        lastMessageAt: "desc", // Sort by lastMessageAt in descending order (newest to oldest)
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user.conversations);
    } catch (error) {
        console.error("Error fetching user chats:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching user chats" },
            { status: 500 }
        );
    }
}
