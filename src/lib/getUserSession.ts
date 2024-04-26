import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "../../prisma";
import { User } from "@/lib/my-types";
import { NextRequest, NextResponse } from "next/server";

// Define the function to get user from session
const getUserFromSession = async (
    req: NextRequest
): Promise<User | NextResponse> => {
    // Get the session using getServerSession
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
        });

        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching user" },
            { status: 500 }
        );
    }
};

export default getUserFromSession;
