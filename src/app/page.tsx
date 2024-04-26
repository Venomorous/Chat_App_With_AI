"use client";
import { getServerSession } from "next-auth/next";
import Image from "next/image";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { useSession } from "next-auth/react";

export default function Home() {
    // const data = await getServerSession(authOptions);
    const { data } = useSession();

    return (
        <main className="h-screen">
            Hello
            {JSON.stringify(data)}
        </main>
    );
}
