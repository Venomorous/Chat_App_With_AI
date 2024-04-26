"use client";
import { useState, useEffect, use } from "react";
import type { Metadata, ResolvingMetadata } from "next";

// import AddChatModal from "@/components/modals/AddChatModal";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatSkeleton } from "@/components/ui/Skeletons";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { MdDelete } from "react-icons/md";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Contact, Chat, User } from "@/lib/my-types";
import { formatTimestamp, getDMMember, getInitials } from "@/lib/helpers";
import socket from "@/socket";
import axios from "axios";
import AddChatModal from "../modals/AddChatModal";
import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";

type ChatListProps = {
    onGetContacts: () => Promise<Contact[]>;
    onSelectChat: (chatId: string) => void;
    selectedChat: string;
    userId: string;
};

// export async function generateMetadata(
//     { userId }: ChatListProps,
//     parent: ResolvingMetadata
// ): Promise<Metadata> {
//     let title = "Chats";

//     const sessionUser = await axios.get(`/api/get-user/${userId}`);

//     if (sessionUser.data.unreadMessagesIds.length > 0) {
//         title = `You have (${sessionUser.data.unreadMessagesIds.length}) unread messages!`;
//     }

//     return {
//         title: title,
//     };
// }

export default function ChatList({
    onGetContacts,
    onSelectChat,
    selectedChat,
    userId,
}: ChatListProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [userData, setUserData] = useState<{ [key: string]: User }>({});
    const [sessionUser, setSessionUser] = useState<User | null>(null);
    const [modalAddChatIsOpen, setModalAddChatIsOpen] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState<
        string | null
    >(null);
    const [isHovered, setIsHovered] = useState<string | null>(null);

    useEffect(() => {
        getChats();
        fetchSessionUser();
    }, []);

    useEffect(() => {
        if (sessionUser && sessionUser.unreadMessagesIds.length > 0) {
            document.title = `(${sessionUser.unreadMessagesIds.length}) Chats`;
        } else {
            document.title = "Chats";
        }
    }, [sessionUser]);

    useEffect(() => {
        if (!socket) {
            console.error("Socket is not connected");
            return;
        }

        const chatChangeListener = async () => {
            getChats();
            await fetchSessionUser();
            // if (sessionUser) {
            //     console.log("CHANGING TITLE");
            //     document.title = `(You have ${sessionUser.unreadMessagesIds.length}) unread messages`;
            // } else {
            //     console.log("NOT CHANGING TITLE");
            //     console.log(sessionUser);
            // }
            // document.title = `(You have ${sessionUser?.unreadMessagesIds.length}) unread messages`;
        };

        socket.on("chat:updated", chatChangeListener);

        return () => {
            socket.off("chat:updated", chatChangeListener);
        };
    }, [socket]);

    const handleDeleteChat = async (chatId: string | null) => {
        if (!chatId) {
            console.error("Chat ID is not defined");
            return;
        }
        try {
            await axios.delete(`/api/delete-chat/${chatId}`);
            setChats(chats.filter((chat) => chat.id !== chatId));
            setDeleteConfirmationOpen(null);
        } catch (error) {
            console.error("Error deleting chat:", error);
            alert("An error occurred while deleting the chat.");
        }
    };

    async function getChats() {
        try {
            const res = await fetch("/api/get-chats");
            if (res.ok) {
                const chats = await res.json();
                setChats(chats);
                // Fetch user data for each chat
                const userPromises = chats.map(async (chat: Chat) => {
                    const dMMemberId = getDMMember(chat, userId);
                    if (dMMemberId) {
                        const dMMember = await axios.get(
                            `/api/get-user/${dMMemberId}`
                        );
                        return { chatId: chat.id, user: dMMember.data }; // Assuming dMMember.data contains the user object
                    }
                    return null;
                });
                const userDataArray = await Promise.all(userPromises);
                const userDataObj = userDataArray.reduce((acc, curr) => {
                    if (curr) acc[curr.chatId] = curr.user;
                    return acc;
                }, {});
                setUserData(userDataObj);
            } else {
                console.error("Failed to fetch chats");
            }
        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    }

    const fetchSessionUser = async () => {
        const sessionUserResponse = await axios.get(`/api/get-user/${userId}`);
        setSessionUser(sessionUserResponse.data);
    };

    const handleAddChat = (selectedContacts: Contact[]) => {
        axios
            .post("/api/add-chat", {
                selectedContacts,
            })
            .then((response) => {
                getChats();
            })
            .catch((error) => {
                console.error("Error while adding chat:", error);
                alert("An error occurred while adding chat");
            });
    };

    const countUnreadMessages = (chat: Chat, user: User | null) => {
        if (!user) return 0;

        const unreadMessages = chat.messagesIds.filter((messageId) =>
            user?.unreadMessagesIds?.includes(messageId)
        );

        return unreadMessages.length;
    };

    return (
        <>
            <section className="h-16 col-span-2flex items-center justify-center bg-primary">
                <AddChatModal
                    onAddChat={handleAddChat}
                    getContacts={onGetContacts}
                />
            </section>

            {chats.length > 0 ? (
                <ul>
                    {chats.map((chat) => {
                        const lastMessage = chat.lastMessage
                            ? chat.lastMessage
                            : "The chat has no messages yet.";
                        const user = userData[chat.id];

                        // console.log("Userdata:", userData);
                        const unreadCount = countUnreadMessages(
                            chat,
                            sessionUser
                        );

                        return (
                            <li
                                key={chat.id}
                                className={`rounded h-20 col-span-2 grid grid-cols-5 grid-rows-2 ${
                                    selectedChat === chat.id
                                        ? "bg-secondary"
                                        : "hover:bg-secondary-300"
                                }`}
                                onClick={() => onSelectChat(chat.id)}
                                onMouseEnter={() => setIsHovered(chat.id)}
                                onMouseLeave={() => setIsHovered(null)}
                            >
                                <div className="row-span-2 col-span-1 md:col-span-2 lg:col-span-1 place-content-center">
                                    {chat.isGroup ? (
                                        <Avatar>
                                            <AvatarImage src={chat?.imageUrl} />
                                            <AvatarFallback>
                                                {getInitials(chat.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <Avatar>
                                            <AvatarImage src={user?.imageUrl} />
                                            <AvatarFallback>
                                                {getInitials(user?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>

                                <div className="col-span-4 row-span-2 flex flex-col justify-between relative md:col-span-3 lg:col-span-4">
                                    {isHovered === chat.id ? (
                                        <div className="absolute top-0 m-1 right-0 flex items-center justify-center h-6 w-6 rounded-full hover:bg-gray-400 cursor-pointer">
                                            <AlertDialog>
                                                <AlertDialogTrigger>
                                                    <div className="flex flex-col items-center justify-center">
                                                        <MdDelete />
                                                    </div>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Are you absolutely
                                                            sure?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot
                                                            be undone. This will
                                                            permanently delete
                                                            this chat and it's
                                                            data from our
                                                            servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction>
                                                            <div
                                                                onMouseEnter={() =>
                                                                    setDeleteConfirmationOpen(
                                                                        chat.id
                                                                    )
                                                                }
                                                                onMouseLeave={() =>
                                                                    setDeleteConfirmationOpen(
                                                                        null
                                                                    )
                                                                }
                                                                // console.log(
                                                                //     deleteConfirmationOpen
                                                                // );
                                                                onClick={() =>
                                                                    handleDeleteChat(
                                                                        deleteConfirmationOpen
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </div>
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    ) : null}
                                    {chat.isGroup ? (
                                        <div>
                                            <p className="font-bold mt-3 mr-5 truncate">
                                                {chat.name}
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="font-bold mt-3 mr-5 truncate">
                                                {user?.name}
                                            </p>
                                        </div>
                                    )}
                                    {lastMessage && (
                                        <>
                                            <p className="text-sm opacity-75 mb-3 mr-16 truncate">
                                                {lastMessage}
                                                {chat.lastMessageSenderId ===
                                                    userId && (
                                                    <>
                                                        {chat.lastMessageSeenIds &&
                                                        chat.lastMessageSeenIds.some(
                                                            (id) =>
                                                                id !== userId
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
                                            </p>
                                            <p className="text-xs opacity-50 absolute bottom-0 right-0 mb-3 mr-1">
                                                <span>
                                                    {formatTimestamp(
                                                        chat.lastMessageAt
                                                    )}
                                                </span>
                                            </p>
                                            <p className="absolute bottom-3 right-14">
                                                {unreadCount > 0 && (
                                                    <span className="inline-flex items-center justify-center bg-secondary-100 text-primary text-xs rounded-full w-5 h-5 mr-2">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <ChatSkeleton />
            )}
        </>
    );
}
