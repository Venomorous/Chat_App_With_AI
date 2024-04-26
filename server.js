const express = require("express");
const next = require("next");
const axios = require("axios");
const cors = require("cors");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const http = require("http");
const socketIO = require("socket.io");

let onlineUsers = [];

app.prepare().then(async () => {
    const server = express();
    const httpServer = http.createServer(server);
    const io = socketIO(httpServer);

    io.on("connection", (socket) => {
        // console.log("Client connected");
        // add new user
        socket.on("new-user-online-add", (newUserId) => {
            if (!onlineUsers.some((user) => user.userId === newUserId)) {
                // if user is not added before
                onlineUsers.push({ userId: newUserId, socketId: socket.id });
                // console.log("new user is here!");
            }
            // send all active users to new user
            // console.log("online users", onlineUsers);
            io.emit("get-online-users", onlineUsers);
        });

        socket.on("sync", (data) => {
            // console.log("Recieved from API ::", data.sync);
            console.log("Recieved from API ::", data.message);
            io.emit("message", data.message);
        });

        socket.on("chat:message:add", (data) => {
            // console.log("Recieved from API ::", data.sync);
            // console.log("Recieved chat ID", data.chatId);
            // console.log("Recieved chat message", data.message);
            io.emit(`chat:${data.chatId}:message`, data.message);
            io.emit("chat:updated");
        });

        socket.on("message:seen", (data) => {
            // console.log("Recieved message ID", data.messageId);
            // console.log("Recieved user ID", data.userId);
            io.emit(`message:seen`, data.messageId, data.userIds);
            io.emit("chat:updated");
        });

        socket.on("disconnect", () => {
            onlineUsers = onlineUsers.filter(
                (user) => user.socketId !== socket.id
            );
            // console.log("user disconnected");
            // send all online users to all users
            io.emit("get-online-users", onlineUsers);
        });

        socket.on("offline", () => {
            // remove user from active users
            onlineUsers = onlineUsers.filter(
                (user) => user.socketId !== socket.id
            );
            // console.log("user is offline", onlineUsers);
            // send all online users to all users
            io.emit("get-online-users", onlineUsers);
        });
    });

    server.all("*", (req, res) => {
        return handle(req, res);
    });

    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
