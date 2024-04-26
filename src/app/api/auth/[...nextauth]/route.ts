import bcrypt from "bcrypt";
import NextAuth, { AuthOptions, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../../../prisma";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                    placeholder: "useremail@gmail.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                // console.log("credentials", credentials);
                if (
                    !credentials ||
                    !credentials.email ||
                    !credentials.password
                ) {
                    // throw new Error("Invalid input");
                    return null;
                }

                // console.log("Connecting");
                await prisma.$connect();
                // console.log("Connected");
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });
                // console.log("user", user);

                if (!user || !user?.hashedPassword) {
                    // throw new Error("invalid email or password");
                    console.log("no user");
                    return null;
                }

                // console.log("user", user);
                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword
                );
                // console.log("isCorrectPassword", isCorrectPassword);

                if (!isCorrectPassword) {
                    // throw new Error("invalid email or password");

                    return null;
                }

                // console.log(user);
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
    pages: {
        signIn: "/login",
        // error: "/",
    },
    callbacks: {
        async jwt({ token, user, session }) {
            if (user) {
                return { ...token, id: user.id };
            }

            return token;
        },
        async session({ session, user, token }) {
            return {
                ...session,
                user: { ...session.user, id: token.id },
            };
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
