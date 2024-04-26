"use client";
import { useState, useEffect, useRef, ElementRef } from "react";
import { Message } from "@/lib/my-types";
import useChatSocket from "@/hooks/use-chat-socket";
import useChatScroll from "@/hooks/use-chat-scroll";
import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";

type ChatMessagesProps = {
    socketUrl: string;
    paramKey: "chatId";
    paramValue: string;
    senderId: string;
    chatId: string;
    contactId: string | null;
    onMessagesChange: (messages: Message[]) => void;
};

export default function ChatMessages({
    paramKey,
    paramValue,
    senderId,
    chatId,
    contactId,
    onMessagesChange,
}: // messages,
ChatMessagesProps) {
    const addKey = `chat:${chatId}:message`;
    const { messages, seenIds } = useChatSocket({
        addKey,
        seenKey: "message:seen",
        paramKey,
        paramValue,
    });
    const [visibleMessages, setVisibleMessages] = useState<string[]>([]);

    const chatRef = useRef<ElementRef<"div">>(null);
    const bottomRef = useRef<ElementRef<"div">>(null);

    useChatScroll({ chatRef, bottomRef, messages });

    useEffect(() => {
        onMessagesChange(messages);
    }, [messages, onMessagesChange]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0.5, // Adjust the threshold as needed (0.5 means 50% of the element is visible)
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Message is now visible
                    setVisibleMessages((prevVisibleMessages) => [
                        ...prevVisibleMessages,
                        entry.target.id,
                    ]);

                    markMessageAsSeen(entry.target.id);
                } else {
                    // Message is no longer visible
                    setVisibleMessages((prevVisibleMessages) =>
                        prevVisibleMessages.filter(
                            (id) => id !== entry.target.id
                        )
                    );
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);

        const messageElements = chatRef.current
            ? chatRef.current.querySelectorAll("li")
            : [];
        messageElements.forEach((element) => observer.observe(element));

        return () => {
            observer.disconnect();
        };
    }, [messages]);

    const markMessageAsSeen = (messageId: string) => {
        fetch(`api/socket/mark-as-seen/${messageId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: senderId }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to mark message as seen");
                }
            })
            .catch((error) => {
                console.log("Message seen error:", error.message);
                // console.error("Error marking message as seen:", error.message);
            });
        // console.log(seenIds);
        // seenIds.map((id) => {
        //     if (id === messageId) {
        //         console.log("Message seen by:", id);
        //     }
        // });
    };

    return (
        <div ref={chatRef}>
            <ul className="list-none px-2">
                {messages.map((message: Message, index: number) => (
                    <li
                        key={message.id}
                        id={message.id}
                        className={`mb-4 ${
                            message.senderId !== senderId
                                ? "text-left"
                                : "text-right"
                        }`}
                    >
                        <div
                            className={`inline-block rounded-full p-2 ${
                                message.senderId !== senderId
                                    ? "bg-secondary-300 text-white px-4"
                                    : "bg-secondary-200 text-gray-800 px-4"
                            } max-w-[70%]`}
                            style={{
                                overflowWrap: "break-word",
                                wordBreak: "break-all",
                            }}
                        >
                            {message.body}
                            {message.senderId === senderId && (
                                <>
                                    {/* {contactId &&
                                    (seenIds.some(
                                        ({ messageId, userId }) =>
                                            messageId === message.id &&
                                            userId === contactId
                                    ) ||
                                        message.seenIds.includes(contactId)) ? (
                                        <>
                                            <IoCheckmarkDone className="inline-block ml-1 mb-1" />
                                        </>
                                    ) : (
                                        <>
                                            <IoCheckmark className="inline-block ml-1 mb-1" />
                                        </>
                                    )} */}
                                    {seenIds.some(
                                        ({ messageId, userIds }) =>
                                            messageId === message.id &&
                                            userIds.some(
                                                (id) => id !== senderId
                                            )
                                    ) ||
                                    message.seenIds.some(
                                        (id) => id !== senderId
                                    ) ? (
                                        <>
                                            <IoCheckmarkDone className="inline-block ml-1 mb-1" />
                                        </>
                                    ) : (
                                        <>
                                            <IoCheckmark className="inline-block ml-1 mb-1" />
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            <div ref={bottomRef} />
        </div>
    );
}
