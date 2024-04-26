import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { SocketProvider } from "@/components/providers/socket-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Chat App",
    description: "A place to talk with your friends",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <main className="bg-primary text-white">
                    <AuthProvider>
                        <SocketProvider>{children}</SocketProvider>
                        {/* {children} */}
                    </AuthProvider>
                </main>
            </body>
        </html>
    );
}
