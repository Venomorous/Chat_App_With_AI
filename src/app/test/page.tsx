"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AIResponseModal from "@/components/modals/AIResponseModal";
import axios from "axios";

type ApiResponse = {
    content: Array<{
        type: string;
        text: string;
    }>;
};

export default function Test() {
    const [responseAI, setResponseAI] = useState<ApiResponse | null>(null);

    async function main() {
        const res = await axios.get("/api/api-response");
        setResponseAI(res.data.message);
        console.log(res.data.message);
    }

    return (
        <div className="h-screen">
            <h1 className="text-4xl text-center">Test</h1>
            {/* <Button className="bg-secondary" onClick={main}>
                Test
            </Button>
            {responseAI && <h1>{responseAI.content[0].text}</h1>} */}
            {/* <AIResponseModal /> */}
        </div>
    );
}
