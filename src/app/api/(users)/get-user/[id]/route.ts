import { NextResponse, NextRequest } from "next/server";
import prisma from "../../../../../../prisma";
import getUserFromSession from "@/lib/getUserSession";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    // console.log(params.id);
    // console.log("request:", req);
    try {
        const sessionUser = await getUserFromSession(req);

        if (!sessionUser)
            return NextResponse.json(
                { error: "User not authorized" },
                { status: 401 }
            );

        const user = await prisma.user.findUnique({
            where: {
                id: params.id,
            },
        });

        if (!user)
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching user by ID" },
            { status: 500 }
        );
    }
}
