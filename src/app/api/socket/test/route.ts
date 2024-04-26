import { NextResponse, NextRequest } from "next/server";
import socket from "@/socket";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        // Extracting message from request body
        const { message } = await req.json();
        console.log("Message from client:", message);

        // Emitting sync event to the socket
        socket.emit("sync", {
            message,
        });
        // socket.emit("message", {
        //     message: message,
        // });

        // Sending success response to the client
        return NextResponse.json({ data: "Success" }, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        // Sending error response to the client
        return NextResponse.json({ error: error }, { status: 200 });
    }
}
