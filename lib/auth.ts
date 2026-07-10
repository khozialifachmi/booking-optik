import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { multiSession } from "better-auth/plugins";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    trustedOrigins: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.15:3000"
    ],
    logger: {
        level: "info",
    },
    emailAndPassword: {  
        enabled: true,
        autoSignIn: false
    },
    user: {
        additionalFields: {
            role: { 
                type: "string",
                defaultValue: "customer",
                input: true
            },
            phone: { 
                type: "string",
                input: true
            }
        }
    },
    plugins: [
        multiSession()
    ]
});
