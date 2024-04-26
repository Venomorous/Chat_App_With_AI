import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "../../../../../prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

const formSchema = z.object({
    username: z.string().refine(
        (value) => {
            const nonSpaceChars = value.replace(/\s/g, "").length;
            return nonSpaceChars >= 2;
        },
        {
            message: "Username must contain at least 2 non-space characters",
        }
    ),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json(
            { error: "User not authorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        formSchema.parse(body);
        const { username } = body;
        // console.log("Username:", username);

        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
        });

        const contact = await prisma.user.findUnique({
            where: {
                username,
            },
        });

        if (!contact) {
            return NextResponse.json(
                { error: "Contact with this username does not exist" },
                { status: 404 }
            );
        }

        if (contact.id === user.id) {
            return NextResponse.json(
                { error: "You cannot add yourself as a contact" },
                { status: 400 }
            );
        }

        if (user.contacts.includes(contact.username)) {
            return NextResponse.json(
                { error: "Contact already exists" },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                contacts: [...user.contacts, contact.username],
            },
        });

        const updatedContact = await prisma.user.update({
            where: {
                id: contact.id,
            },
            data: {
                contacts: [...contact.contacts, user.username],
            },
        });

        return NextResponse.json(
            {
                message: "Contact found",
                contact,
                user: session.user,
                updatedUser: updatedUser,
                updatedContact: updatedContact,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error while adding contact:", error);
        return NextResponse.json(
            { error: "An error occurred while processing the request" },
            { status: 500 }
        );
    }
}
