import { connectToDatabase } from "@/lib/mongo-utils";
import { NextResponse } from "next/server";
import prisma from "../../../../prisma";
import bcrypt from "bcrypt";

export const POST = async (req: Request) => {
    try {
        const { name, email, password } = await req.json();
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Invalid input" },
                { status: 422 }
            );
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        await connectToDatabase();
        const user = await prisma.user.create({
            data: { email, name, hashedPassword },
        });

        return NextResponse.json({ user }, { status: 201 });
    } catch (e) {
        console.log(e);

        return NextResponse.json(
            { message: "Could not create user" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
};
