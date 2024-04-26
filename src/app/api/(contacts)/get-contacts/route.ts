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

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email,
        },
    });

    const contacts = await prisma.user.findMany({
        where: {
            username: {
                in: user.contacts,
            },
        },
    });

    return NextResponse.json(contacts);
}
