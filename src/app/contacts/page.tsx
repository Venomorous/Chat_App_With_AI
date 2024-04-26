"use client";
import { use, useEffect, useState } from "react";
import axios from "axios";
import useChatSocket from "@/hooks/use-chat-socket";
import socket from "@/socket";
import { Message, Contact } from "@/lib/my-types";
import AddChatModal from "@/components/modals/AddChatModal";

const Page = () => {
    // const [messages, setMessages] = useState<Message[]>([]);
    const { messages } = useChatSocket({ addKey: `sync` });
    // const [newMessage, setNewMessage] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [input, setInput] = useState("");

    useChatSocket({ addKey: `sync` });

    const sendMessage = async () => {
        const newMessage = {
            body: input,
        };
        const res = await axios.post("/api/socket/test", {
            message: newMessage,
        });

        // console.log("Response from server:", res.data);
        setInput("");
    };

    const onAddChat = (selectedContacts: Contact[]) => {
        console.log("Chat added");
        console.log(selectedContacts);
    };

    useEffect(() => {
        messages.map((message) => {
            console.log("Message from server:", message);
        });
    }, [messages]);

    const getContacts = async () => {
        const res = await axios.get("/api/get-contacts");
        return res.data;
        // console.log("Contacts from server:", res.data);
    };

    useEffect(() => {
        getContacts();
    }, []);
    // useEffect(() => {
    //     if (socket.connected) {
    //         setIsConnected(true);
    //     } else {
    //         setIsConnected(false);
    //     }
    //     if (!socket) {
    //         console.log("Socket is not connected", socket);
    //         return;
    //     }

    //     console.log("Socket is connected", socket);

    // const messageListener = (messageObject: { message: string }) => {
    //     console.log("Message received:", messageObject.message);
    //     setMessages((prevMessages) => [
    //         ...prevMessages,
    //         messageObject.message,
    //     ]);
    // };

    // Attach the event listener
    // socket.on("message", messageListener);

    // Clean up the event listener when component unmounts
    // return () => {
    //     socket.off("message", messageListener);
    // };
    // }, [socket]);

    // useEffect(() => {
    //     socket.on("message2", (data) => {
    //         console.log("Recieved from SERVER ::", data);
    //         // Execute any command
    //     });
    // }, [socket]);

    return (
        <div>
            {/* <h1>Real-Time Chat</h1>
            {isConnected ? (
                <p>Connected to server</p>
            ) : (
                <p>Not connected to server</p>
            )}
            <div>
                <p>Messages has {messages.length} objects</p>
                {messages.map((message, index) => (
                    <div key={index}>{message.body}</div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button> */}
            <AddChatModal getContacts={getContacts} onAddChat={onAddChat} />
        </div>
    );
};

export default Page;
