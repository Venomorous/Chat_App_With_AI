// import { Contact } from "@prisma/client";
import { Server, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";

export type User = {
    id: string;
    username: string;
    email: string;
    name?: string;
    hashedPassword: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    contacts: string[];
    conversationIds: string[];
    conversations: Chat[];
    messages: Message[];
    seenMessageIds: string[];
    unreadMessagesIds: string[];
};

export type Contact = {
    id: string;
    username: string;
    name: string;
    imageUrl: string;
};

export type Chat = {
    id: string;
    createdAt?: Date;
    lastMessageAt: Date;
    name?: string;
    isGroup?: boolean;
    imageUrl?: string;

    messagesIds: string[];
    messages: Message[];

    lastMessage?: string;
    lastMessageSenderId?: string;
    lastMessageSeenIds: string[];

    userIds: string[];
    users: User[];
};

export type Message = {
    id: string;
    body?: string;
    image?: string;
    createdAt: Date;
    seenIds: string[]; // Array of IDs referencing seen users
    seen: User[]; // Array of User objects representing users who have seen the message
    conversationId: string; // ID referencing the conversation this message belongs to
    senderId: string; // ID referencing the user who sent the message
};

export type usersOnline = {
    userId: string;
    socketId: string;
};

export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
        server: Server & {
            io: ServerIO;
        };
    };
};
