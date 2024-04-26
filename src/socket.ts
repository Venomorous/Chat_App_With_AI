import io from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
const socket = io(socketUrl);

export default socket;
