import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "../../../../../prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Contact } from "@/lib/my-types";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    let isGroupChat = false;
    let chatName = "";

    if (!session || !session.user) {
        return NextResponse.json(
            { error: "User not authenticated" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { selectedContacts } = body;

        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
        });

        const contacts = await prisma.user.findMany({
            where: {
                username: {
                    in: selectedContacts.map(
                        (contact: Contact) => contact.username
                    ),
                },
            },
        });

        if (contacts.length !== selectedContacts.length) {
            return NextResponse.json(
                { error: "One or more contacts do not exist" },
                { status: 404 }
            );
        }

        if (contacts.some((contact: Contact) => contact.id === user.id)) {
            return NextResponse.json(
                { error: "You cannot add yourself as a contact" },
                { status: 400 }
            );
        }

        if (contacts.length > 1) {
            // For group chat, set isGroupChat to true and concatenate names of all users
            isGroupChat = true;
        } else {
            // For individual chat
            const existingConversation = await prisma.conversation.findFirst({
                where: {
                    AND: [
                        { userIds: { has: user.id } }, // Check if user's ID is in the userIds array
                        { userIds: { has: contacts[0].id } }, // Check if contact's ID is in the userIds array
                        { isGroup: false }, // Ensure it's not a group conversation
                    ],
                },
            });

            // Check if an existing conversation with the same contact exists
            if (existingConversation) {
                return NextResponse.json(
                    {
                        error: "You cannot create 2 private chats with the same contact",
                    },
                    { status: 400 }
                );
            }
        }
        chatName = `${user.name}, ${contacts
            .map((contact: Contact) => contact.name)
            .join(", ")}`;

        // console.log("Contacts:", contacts);

        const conversation = await prisma.conversation.create({
            data: {
                name: chatName,
                isGroup: isGroupChat,
                users: {
                    connect: [
                        { id: user.id }, // Connect the user
                        ...contacts.map((contact: Contact) => ({
                            id: contact.id,
                        })), // Connect the contacts
                    ],
                },
            },
        });

        return NextResponse.json(
            {
                message: "Chat added successfully",
                user: session.user,
                createdConversation: conversation,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error while adding chat:", error);
        return NextResponse.json(
            { error: "An error occurred while processing the request" },
            { status: 500 }
        );
    }
}
