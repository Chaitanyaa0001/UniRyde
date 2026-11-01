import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { deleteAllSessions } from "../../utils/session";
import { getIO } from "../../lib/socket.js";
// Get Current User Service
export const getCurrentUserService = async (userId) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            username: true,
            email: true,
            profilePhotoUrl: true,
        },
    });
    return user;
};
// Update Current User Service
export const updateCurrentUserService = async (userId, data) => {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.username !== undefined && {
                    username: data.username,
                }),
                ...(data.email !== undefined && {
                    email: data.email,
                }),
            },
            select: {
                id: true,
                username: true,
                email: true,
                profilePhotoUrl: true,
            },
        });
        return user;
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new AppError(409, "A unique field already exists");
            }
            if (error.code === "P2025") {
                throw new AppError(404, "User not found");
            }
        }
        throw error;
    }
};
// Delete Current User Service
export const deleteCurrentUserService = async (userId) => {
    await prisma.user.delete({
        where: { id: userId },
    });
    await deleteAllSessions(userId);
    getIO().in(`user:${userId}`).disconnectSockets(true);
};
//# sourceMappingURL=users.service.js.map