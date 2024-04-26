import { useState, useEffect, use } from "react";
import { Message, usersOnline } from "@/lib/my-types";
import axios from "axios";
// import socket from "@/socket";
import { useSocket } from "@/components/providers/socket-provider";

type UseChatSocketOptions = {
    addKey: string;
    seenKey?: string;
    // updateKey: string;
    paramKey?: string;
    paramValue?: string;
};

export default function useChatSocket({
    addKey,
    seenKey,
    // updateKey,
    paramKey,
    paramValue,
}: UseChatSocketOptions) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [seenIds, setSeenIds] = useState<
        { messageId: string; userIds: string[] }[]
    >([]);
    const { socket } = useSocket();

    useEffect(() => {
        // console.log("useEffect on useChatSocket started");
        if (paramKey === undefined || paramValue === undefined) {
            console.log("paramKey or paramValue is undefined");
        } else {
            // console.log(`${paramKey}:`, paramValue);
            const getMessages = async () => {
                const response = await fetch(
                    `/api/get-messages?${paramKey}=${paramValue}`
                );
                const data = await response.json();
                setMessages(data);
            };
            if (messages.length === 0) {
                getMessages();
            }
        }
    }, []);

    useEffect(() => {
        if (!addKey) {
            console.error("addKey is not defined");
            return;
        }

        // console.log("useEffect on useChatSocket started");
        if (!socket) {
            console.error("Socket is not connected");
            return;
        }

        // console.log(paramKey, paramValue);
        // console.log("Add Key:", addKey);

        const messageAddListener = (message: Message) => {
            // console.log("Message received:", message);
            setMessages((prevMessages) => [...prevMessages, message]);
        };
        socket.on(addKey, messageAddListener);

        const messageTestListener = (message: Message) => {
            console.log("Message TESTING received:", message);
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        const messageSeenListener = (messageId: string, userIds: string[]) => {
            setSeenIds((prevSeenIds) => [
                ...prevSeenIds,
                { messageId, userIds },
            ]);
            // console.log(`Message ${messageId} seen:`, userIds);
        };

        if (seenKey) {
            socket.on(seenKey, messageSeenListener);
        }

        socket.on("message", messageTestListener);

        return () => {
            if (socket) {
                socket.off(addKey, messageAddListener);
                if (seenKey) {
                    socket.off(seenKey, messageSeenListener);
                }
                // socket.off(updateKey, messageUpdateListener);
                socket.off("message", messageTestListener);
            }
        };
    }, [socket]);

    return { messages, seenIds };
}
