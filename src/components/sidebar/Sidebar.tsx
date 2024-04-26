"use client";
import { useState } from "react";

import ChatList from "@/components/sidebar/ChatList";
import ContactList from "@/components/sidebar/ContactList";
import { IoIosChatboxes } from "react-icons/io";
import { IoPersonSharp } from "react-icons/io5";

type SidebarProps = {
    onSelectChat: (chatId: string) => void;
    selectedChat: string;
    userId: string;
};

export default function Sidebar({
    onSelectChat,
    selectedChat,
    userId,
}: SidebarProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState("chats");

    async function getContacts() {
        try {
            const res = await fetch("/api/get-contacts");
            if (res.ok) {
                const contacts = await res.json();
                return contacts;
            } else {
                console.error("Failed to fetch contacts");
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    }

    return (
        <aside className="overflow-auto h-screen bg-primary-100">
            <section className="grid grid-cols-2 gap-0">
                <section
                    className="h-16 flex items-center justify-center  hover:bg-secondary-300 cursor-pointer bg-primary"
                    onClick={() => setSelectedOption("chats")}
                >
                    <div className="flex items-center">
                        <IoIosChatboxes />
                        <span className="ml-2">Chats</span>
                    </div>
                </section>
                <section
                    className="h-16 flex items-center justify-center  hover:bg-secondary-300 cursor-pointer bg-primary"
                    onClick={() => setSelectedOption("contacts")}
                >
                    <div className="flex items-center">
                        <IoPersonSharp />
                        <span className="ml-2">Contacts</span>
                    </div>
                </section>
                <div className="col-span-2 ">
                    {selectedOption === "chats" && (
                        <ChatList
                            onGetContacts={getContacts}
                            onSelectChat={onSelectChat}
                            selectedChat={selectedChat}
                            userId={userId}
                        />
                    )}
                    {selectedOption === "contacts" && (
                        <ContactList onGetContacts={getContacts} />
                    )}
                </div>
            </section>
        </aside>
    );
}
