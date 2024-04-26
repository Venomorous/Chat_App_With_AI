// import { NextResponse } from "next/server";
// import bcrypt from "bcrypt";

// import prisma from "../../../../../prisma";

// export async function POST(req: Request) {
//     const body = await req.json();

//     const { username, email, password, name } = body;

//     const hashedPassword = await bcrypt.hash(password, 12);
//     const imageUrl = "";

//     const emailExists = await prisma.user.findUnique({
//         where: {
//             email,
//         },
//     });

//     const usernameExists = await prisma.user.findUnique({
//         where: {
//             username,
//         },
//     });

//     if (emailExists) {
//         return NextResponse.json({
//             error: "User with this email already exists",
//         });
//     }

//     if (usernameExists) {
//         return NextResponse.json({
//             error: "User with this username already exists",
//         });
//     }

//     const user = await prisma.user.create({
//         data: {
//             email,
//             username,
//             hashedPassword,
//             name,
//             imageUrl,
//         },
//     });

//     return NextResponse.json(user);
// }
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import * as z from "zod";

import prisma from "../../../../../prisma";

const formSchema = z.object({
    username: z.string().refine(
        (value) => {
            const nonSpaceChars = value.replace(/\s/g, "").length;
            return nonSpaceChars >= 2;
        },
        {
            message: "Username must contain at least 2 non-space characters",
        }
    ),
    name: z.string().refine(
        (value) => {
            const nonSpaceChars = value.replace(/\s/g, "").length;
            return nonSpaceChars >= 2;
        },
        {
            message: "Name must be at least 2 non-space characters",
        }
    ),
    email: z.string().email(),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters long",
    }),
});

export async function POST(req: Request) {
    const body = await req.json();

    try {
        // Validate request body against formSchema
        formSchema.parse(body);

        const { username, email, password, name } = body;

        const hashedPassword = await bcrypt.hash(password, 12);
        const imageUrl = "";

        const emailExists = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        const usernameExists = await prisma.user.findUnique({
            where: {
                username,
            },
        });

        if (emailExists) {
            return NextResponse.json({
                error: "User with this email already exists",
            });
        }

        if (usernameExists) {
            return NextResponse.json({
                error: "User with this username already exists",
            });
        }

        const user = await prisma.user.create({
            data: {
                email,
                username,
                hashedPassword,
                name,
                imageUrl,
            },
        });

        return NextResponse.json(user);
    } catch (error: any) {
        // Handle validation errors
        return NextResponse.json(
            {
                error: error.formErrors.fieldErrors,
            },
            { status: 400 }
        );
    }
}
