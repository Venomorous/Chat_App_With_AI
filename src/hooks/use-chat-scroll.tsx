"use client";

import { Message } from "@/lib/my-types";
import { useState, useEffect } from "react";

type ChatScrollProps = {
    chatRef: React.RefObject<HTMLDivElement>;
    bottomRef: React.RefObject<HTMLDivElement>;
    messages: Message[];
};

export default function useChatScroll({
    chatRef,
    bottomRef,
    messages,
}: ChatScrollProps) {
    const [hasInitialised, setHasInitialised] = useState(false);

    useEffect(() => {
        const topDiv = chatRef?.current;

        const handleScroll = () => {
            const scrollTop = topDiv?.scrollTop || 0;

            if (scrollTop === 0) {
                console.log("Top of chat reached");
            }
        };

        topDiv?.addEventListener("scroll", handleScroll);

        return () => {
            topDiv?.removeEventListener("scroll", handleScroll);
        };
    }, [chatRef]);

    useEffect(() => {
        const bottomDiv = bottomRef?.current;
        const topDiv = chatRef?.current;
        const shouldAutoScroll = () => {
            if (!hasInitialised && bottomDiv) {
                setHasInitialised(true);
                return true;
            }

            if (!topDiv) {
                return false;
            }

            const distanceFromBottom =
                topDiv?.scrollHeight - topDiv?.scrollTop - topDiv?.clientHeight;

            return distanceFromBottom <= 100;
        };

        if (shouldAutoScroll()) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: "auto" });
            }, 100);
        }
    }, [bottomRef, chatRef, hasInitialised, messages]);

    // useEffect(() => {
    //     if (chatRef.current && bottomRef.current) {
    //         chatRef.current.scrollTop = bottomRef.current.offsetTop;
    //     }
    // }, [chatRef, bottomRef]);
}
