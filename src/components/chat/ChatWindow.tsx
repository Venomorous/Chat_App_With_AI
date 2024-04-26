"use client";
import { useState, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { User, Chat, usersOnline } from "@/lib/my-types";
import ChatMessages from "@/components/chat/ChatMessages";
import AIResponseModal from "@/components/modals/AIResponseModal";
import axios from "axios";
import { getDMMember } from "@/lib/helpers";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { messageFormSchema, useMessageForm } from "@/lib/formSchemas";

import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { IoMdSend } from "react-icons/io";
import { WiStars } from "react-icons/wi";
import { Message } from "@/lib/my-types";
// import SocketIndicator from "../SocketIndicator";

type ChatWindowProps = {
    selectedChat: string;
    userId: string;
    onlineUsers: usersOnline[];
    // onlineUsers: usersOnline[];
};

export default function ChatWindow({
    selectedChat,
    userId,
    onlineUsers,
}: // onlineUsers,
ChatWindowProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUserOnline, setIsUserOnline] = useState(false);
    const [dMMemberId, setDMMemberId] = useState<string | null>(null);

    const [chatData, setChatData] = useState<Chat | null>(null);
    const [userData, setUserData] = useState<User>();

    const [messages, setMessages] = useState<Message[]>([]);
    const [AIResponse, setAIResponse] = useState<string | null>(null);
    const [AIResponseModalOpen, setAIResponseModalOpen] = useState(false);

    const [lastAPICallTime, setLastAPICallTime] = useState(0);
    const cooldownPeriod = 5000; // 5000 ms or 5 seconds cooldown between API calls

    // const messageFormSchema = z.object({
    //     message: z.string(),
    // });

    // const form = useForm<z.infer<typeof messageFormSchema>>({
    //     resolver: zodResolver(messageFormSchema),
    //     defaultValues: {
    //         message: "",
    //     },
    // });

    const messageForm = useMessageForm();

    // console.log(onlineUsers);

    useEffect(() => {
        if (selectedChat) {
            fetchChatData(selectedChat);
        }
    }, [selectedChat]);

    const fetchChatData = async (chatId: string) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/get-chat/${chatId}`);
            if (response.status === 200) {
                setChatData(response.data);

                const dMMemberId = getDMMember(response.data, userId);
                setDMMemberId(dMMemberId);

                if (dMMemberId) {
                    const dMMember = await axios.get(
                        `/api/get-user/${dMMemberId}`
                    );
                    setUserData(dMMember.data);
                }
            } else {
                console.error("Failed to fetch chat data");
            }
        } catch (error) {
            console.error("Error fetching chat data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    //     e.preventDefault();
    //     try {
    //         if (!selectedChat || selectedChat === "") {
    //             console.error("No chat selected.");
    //             return;
    //         }

    //         console.log("Sending message:", enteredMessage);

    //         setEnteredMessage("");
    //         const url = `/api/socket/messages?chatId=${selectedChat}`;

    //         const response = await axios.post(
    //             url,
    //             {
    //                 message: enteredMessage,
    //             },
    //             {
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //             }
    //         );
    //     } catch (error) {
    //         console.error("Error sending message:", error);
    //     }
    // }
    const onSubmit = async (values: z.infer<typeof messageFormSchema>) => {
        // console.log("Sending message:", values);
        messageForm.reset();

        //! Uncomment the following block of code to send messages to the server
        try {
            const response = await axios.post(
                `/api/socket/messages?chatId=${selectedChat}`,
                {
                    message: values.message,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            // Handle the response from the server
            // console.log("Message sent successfully:", response.data);

            // Reset the form
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleAIResponseClick = () => {
        const now = Date.now();

        setAIResponseModalOpen((prevState) => !prevState);

        if (now - lastAPICallTime > cooldownPeriod) {
            // Enough time has passed; trigger the API call
            setLastAPICallTime(now);
            fetchAIApi();
        } else {
            console.log("Please wait before trying again.");
        }
    };

    useEffect(() => {
        if (onlineUsers && userData) {
            const isUserOnline = onlineUsers.some(
                (user) => user.userId === userData.id
            );
            setIsUserOnline(isUserOnline);
        }
    }, [onlineUsers, userData]);

    const fetchAIApi = async () => {
        try {
            const response = await axios.post("/api/api-response", {
                user: userData?.name,
                messages: messages.slice(-10),
            });

            console.log(response.data); // Log or handle the response data
            setAIResponse(response.data);
            // return response.data; // Optionally return the data for further processing
        } catch (error) {
            console.error("Error sending messages to API:", error);
            return null; // Handle errors or return a null/error state as needed
        }
    };

    return (
        <main className="h-screen flex flex-col">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="flex justify-center items-center">
                        <div className="w-6 h-6 border-2 border-white border-opacity-25 rounded-full animate-spin"></div>
                        <span className="ml-2">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    {chatData ? (
                        <>
                            <div className="rounded min-h-16 bg-secondary-500 px-3 py-2">
                                {chatData.isGroup ? (
                                    <p>{chatData.name}</p>
                                ) : (
                                    <>
                                        <p>{userData?.name}</p>
                                        {isUserOnline ? (
                                            <span className="text-xs text-fuchsia-600">
                                                Online
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                Offline
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            <ScrollArea className="flex-grow">
                                <div className="">
                                    {chatData.messagesIds &&
                                    chatData.messagesIds.length > 0 ? (
                                        <ChatMessages
                                            socketUrl="/api/socket/messages"
                                            paramKey="chatId"
                                            paramValue={selectedChat}
                                            senderId={userId}
                                            chatId={selectedChat}
                                            contactId={
                                                chatData.isGroup
                                                    ? null
                                                    : dMMemberId
                                            }
                                            onMessagesChange={setMessages}
                                        />
                                    ) : (
                                        <p className="text-center text-gray-500 mt-8">
                                            This chat has no messages
                                        </p>
                                    )}
                                </div>
                            </ScrollArea>
                            {AIResponseModalOpen && (
                                <AIResponseModal
                                    AIResponse={AIResponse}
                                    regenerate={fetchAIApi}
                                    form={messageForm}
                                    onSubmit={messageForm.handleSubmit(
                                        onSubmit
                                    )}
                                    onClose={() =>
                                        setAIResponseModalOpen(false)
                                    }
                                />
                            )}
                            <div
                                className={`min-h-16 flex justify-between px-2`}
                            >
                                <Form {...messageForm}>
                                    <form
                                        onSubmit={messageForm.handleSubmit(
                                            onSubmit
                                        )}
                                        className="w-full flex items-center justify-between" // Changed from flex-col to flex for a single row
                                    >
                                        <Button
                                            type="button"
                                            onClick={handleAIResponseClick}
                                            className="rounded-md p-0 h-7 ml-0 mr-1 bg-transparents text-white flex items-center hover:bg-secondary-300"
                                            title="Generate AI Response"
                                        >
                                            <WiStars size={30} />
                                        </Button>

                                        <FormField
                                            control={messageForm.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem className="flex-grow mr-2">
                                                    {" "}
                                                    {/* Adjusted for flexible growth */}
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            id="message"
                                                            placeholder="Type your message..."
                                                            className="px-3 py-2 bg-primary-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 text-white"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            className="rounded-full px-3 py-1 bg-secondary-300 text-white flex items-center hover:bg-secondary"
                                        >
                                            <span className="px-2">Send</span>
                                            <IoMdSend />
                                        </Button>
                                    </form>
                                </Form>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-center text-zinc-300">
                                Choose a chat to start messaging...
                            </p>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
