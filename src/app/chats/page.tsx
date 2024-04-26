"use client";
import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useSession } from "next-auth/react";
import useChatSocket from "@/hooks/use-chat-socket";
import Link from "next/link";
import { useOnlineUsers } from "@/components/providers/socket-provider";

export default function Page() {
    const { data: session, status } = useSession();
    const [selectedChat, setSelectedChat] = useState("");

    const onlineUsers = useOnlineUsers();
    // const { onlineUsers } = useChatSocket({
    //     addKey: "user:online",
    //     userId: session?.user?.id,
    // });

    // Show loading indicator while session status is loading
    if (status === "loading") {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    const handleChatSelect = (chatId: string) => {
        setSelectedChat(chatId);
        // console.log(session?.user?.id);
    };

    // console.log(selectedChat);

    return (
        <div className="grid grid-flow-row-dense grid-cols-9 grid-rows-1 h-screen bg-primary">
            {session ? (
                <>
                    <div className="col-span-2">
                        <Sidebar
                            onSelectChat={handleChatSelect}
                            selectedChat={selectedChat}
                            userId={session.user.id}
                        />
                    </div>
                    <div className="col-span-7">
                        <ChatWindow
                            selectedChat={selectedChat}
                            userId={session.user.id}
                            onlineUsers={onlineUsers}
                            // onlineUsers={onlineUsers}
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="col-span-9 flex flex-col justify-center items-center">
                        <p className="text-2xl text-red-500 font-semibold">
                            User not authorized
                        </p>
                        <Link href="/login" className="">
                            Go back to login page
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
