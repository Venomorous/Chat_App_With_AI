// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const client = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") globalThis.prisma = client;

export default client;

// // @ts-nocheck
//import { PrismaClient } from "@prisma/client";

// let prisma: PrismaClient;
// declare global {
//     namespace NodeJS {
//         interface Global {
//             prisma: PrismaClient;
//         }
//     }
// }

// if (process.env.NODE_ENV === "production") {
//     prisma = new PrismaClient();
// } else {
//     if (!global.prisma) {
//         global.prisma = new PrismaClient();
//     }
//     prisma = global.prisma;
// }

// export default prisma;
