import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/mongo-utils";
import { NextResponse } from "next/server";
import NextAuth, { AuthOptions, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../../prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "email", type: "text" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials) {
                if (
                    !credentials ||
                    !credentials.email ||
                    !credentials.password
                ) {
                    return NextResponse.json(
                        { message: "Invalid input" },
                        { status: 422 }
                    );
                    // throw new Error("Invalid input");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user?.hashedPassword) {
                    return NextResponse.json(
                        { message: "Invalid email or password" },
                        { status: 401 }
                    );
                    // throw new Error("invalid email or password");
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword
                );

                if (!isCorrectPassword) {
                    return NextResponse.json(
                        { message: "Invalid email or password" },
                        { status: 401 }
                    );
                    // throw new Error("invalid email or password");
                }

                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.NEXTAUTH_JWT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// export const POST = async (req: Request) => {
//     try {
//         const { email, password } = await req.json();
//         if (!email || !password) {
//             return NextResponse.json(
//                 { message: "Invalid input" },
//                 { status: 422 }
//             );
//         }

//         await connectToDatabase();
//         const user = await prisma.user.findUnique({ where: { email } });

//         if (!user || !user.hashedPassword) {
//             // User not found or password not set
//             return NextResponse.json(
//                 { message: "Invalid email or password" },
//                 { status: 401 }
//             );
//         }

//         const isCorrectPassword = await bcrypt.compare(
//             password,
//             user.hashedPassword
//         );
//         if (!isCorrectPassword) {
//             // Incorrect password
//             return NextResponse.json(
//                 { message: "Invalid email or password" },
//                 { status: 401 }
//             );
//         }

//         // Password correct, return user
//         return NextResponse.json({ user }, { status: 200 });
//     } catch (e) {
//         console.error("Error during login:", e);
//         return NextResponse.json(
//             { message: "Could not complete login process" },
//             { status: 500 }
//         );
//     } finally {
//         await prisma.$disconnect();
//     }
// };

//-------------------SECOND EXAMPLE-------------------
// export const authOptions: AuthOptions = {
//     adapter: PrismaAdapter(prisma),
//     providers: [
//         CredentialsProvider({
//             name: "credentials",
//             credentials: {
//                 email: {
//                     label: "Email",
//                     type: "text",
//                     placeholder: "useremail@gmail.com",
//                 },
//                 password: { label: "Password", type: "password" },
//             },
//             async authorize(credentials, req) {
//                 if (
//                     !credentials ||
//                     !credentials.email ||
//                     !credentials.password
//                 ) {
//                     throw new Error("Invalid input");
//                 }

//                 const user = await prisma.user.findUnique({
//                     where: { email: credentials.email },
//                 });

//                 if (!user || !user?.hashedPassword) {
//                     throw new Error("invalid email or password");
//                 }

//                 const isCorrectPassword = await bcrypt.compare(
//                     credentials.password,
//                     user.hashedPassword
//                 );

//                 if (!isCorrectPassword) {
//                     throw new Error("invalid email or password");
//                 }

//                 return user;
//             },
//         }),
//     ],
//     // pages: {
//     //     signIn: "/",
//     //     error: "/",
//     // },
// };
// export const authOptions: AuthOptions = {
//     providers: [
//         CredentialsProvider({
//             name: "credentials",
//             credentials: {
//                 email: {
//                     label: "Email",
//                     type: "text",
//                     placeholder: "useremail@gmail.com",
//                 },
//                 password: { label: "Password", type: "password" },
//             },
//             async authorize(credentials, req) {
//                 if (
//                     !credentials ||
//                     !credentials.email ||
//                     !credentials.password
//                 ) {
//                     throw new Error("Invalid input");
//                 }

//                 const user = {
//                     id: 1,
//                     name: "John Doe",
//                     email: credentials.email,
//                     password: credentials.password,
//                 };

//                 return user;
//             },
//         }),
//     ],
//     // pages: {
//     //     signIn: "/",
//     //     error: "/",
//     // },
// };

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
