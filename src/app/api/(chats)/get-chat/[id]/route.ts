import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { NextApiRequest } from "next/types";
import prisma from "../../../../../../prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import getUserFromSession from "@/lib/getUserSession";

export async function GET(
    req: NextApiRequest,
    { params }: { params: { id: string } }
) {
    // console.log(params.id);
    // console.log("request:", req);

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json(
            { error: "User not authorized" },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
            include: {
                conversations: true,
            },
        });

        // const user = await getUserFromSession(req);

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: params.id,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("Error fetching user chats:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching user chats" },
            { status: 500 }
        );
    }
}
