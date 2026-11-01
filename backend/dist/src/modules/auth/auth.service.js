import { prisma } from "../../lib/prisma.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { AppError } from "../../utils/app-error.js";
import { createSession, deleteAllSessions, deleteSession, } from "../../utils/session.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { getIO } from "../../lib/socket.js";
// Register Service
export const registerService = async (data) => {
    try {
        const passwordHash = await hashPassword(data.password);
        const user = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: passwordHash,
            },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });
        return { user };
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new AppError(409, "Email or username already exists");
            }
        }
        throw error;
    }
};
// Login Service
export const loginService = async (data) => {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
        select: {
            id: true,
            username: true,
            email: true,
            password: true,
        },
    });
    if (!user) {
        throw new AppError(401, "Invalid email or password");
    }
    const isPasswordValid = await verifyPassword(user.password, data.password);
    if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password");
    }
    const sessionId = await createSession(user.id);
    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
        sessionId,
    };
};
// Logout Service
export const logoutService = async (userId, sessionId) => {
    await deleteSession(userId, sessionId);
    getIO().in(`user:${userId}`).disconnectSockets(true);
};
// Logout All Service
export async function logoutAllService(userId) {
    await deleteAllSessions(userId);
    getIO().in(`user:${userId}`).disconnectSockets(true);
}
//# sourceMappingURL=auth.service.js.map