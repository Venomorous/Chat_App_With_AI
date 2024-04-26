"use client";
// import { useState, useEffect, createContext, useContext } from "react";
// import socket from "@/socket"; // Ensure this is the same socket instance used in your application

// type SocketContextType = {
//     socket: any | null;
//     isConnected: boolean;
// };

// const SocketContext = createContext<SocketContextType>({
//     socket: null,
//     isConnected: false,
// });

// export const useSocket = () => useContext(SocketContext);

// export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//     const [isConnected, setIsConnected] = useState(false);

//     useEffect(() => {
//         console.log("SocketProvider started");

//         socket.on("connect", () => {
//             console.log("Connected to socket server");
//             setIsConnected(true);
//         });

//         socket.on("disconnect", () => {
//             setIsConnected(false);
//         });

//         return () => {
//             socket.disconnect();
//         };
//     }, []);

//     return (
//         <SocketContext.Provider value={{ socket, isConnected }}>
//             {children}
//         </SocketContext.Provider>
//     );
// };
import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { usersOnline } from "@/lib/my-types";

// Define the type for the socket context
type SocketContextType = {
    socket: Socket | null;
    onlineUsers: usersOnline[];
};

// Create the socket context
const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: [],
});

// Create a custom hook to access the socket context
export const useSocket = () => useContext(SocketContext);

// Create a provider component to manage the socket connection
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [onlineUsers, setOnlineUsers] = useState<usersOnline[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const { data: session, status } = useSession();
    const userId = session?.user?.id;

    useEffect(() => {
        // Initialize the socket connection
        const socketUrl =
            process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
        const newSocket = io(socketUrl, { query: { userId } });

        // Set the socket state
        setSocket(newSocket);

        // Clean up function to disconnect the socket when the component unmounts
        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!userId) {
            console.error("User ID is not defined");
            return;
        }

        if (!socket) {
            console.error("Socket is not connected");
            return;
        }

        socket.emit("new-user-online-add", { userId });

        socket.on("get-online-users", (users) => {
            // console.log("Online Users:", users);
            setOnlineUsers(users);
        });

        return () => {
            if (socket) socket.off("get-online-users");
        };
    }, [userId]);

    useEffect(() => {
        const handleFocus = async () => {
            if (!socket) {
                console.error("Socket is not connected");
                return;
            }
            socket.emit("new-user-online-add", userId);
            socket.on("get-online-users", (users) => {
                // console.log("User is online");
                setOnlineUsers(users);
            });
        };

        // Tab closed
        const handleBlur = () => {
            if (!socket) {
                console.error("Socket is not connected");
                return;
            }
            if (userId) {
                // console.log("User is offline");
                socket.emit("offline");
            }
        };

        // Track if the user changes the tab to determine when they are online
        window.addEventListener("focus", handleFocus);
        window.addEventListener("blur", handleBlur);

        // console.log("Online Users:", onlineUsers);
        return () => {
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("blur", handleBlur);
        };
    }, [userId]);

    // Provide the socket context value to its children
    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

// Custom hook to access the onlineUsers state
export const useOnlineUsers = () => {
    const { onlineUsers } = useSocket();
    return onlineUsers;
};
