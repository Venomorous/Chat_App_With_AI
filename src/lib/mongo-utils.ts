import prisma from "../../prisma";
// import prisma from "@prisma/client";

export const connectToDatabase = async () => {
    try {
        await prisma.$connect();
    } catch (error) {
        console.log(error);
        throw new Error("Could not connect to database");
    }
};
