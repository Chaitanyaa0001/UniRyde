
import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { Socket } from "socket.io";

import { prisma } from "./prisma.js";
import { env } from "../config/env.config.js";
import { getUserIdFromSession } from "../utils/session.js";
import { registerChatSocket } from "../modules/chat/chat.socket.js";

let io: Server | undefined;

const getCookie = (
  cookieHeader: string | undefined,
  name: string,
) => {
  const value = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);

  return value ? decodeURIComponent(value) : undefined;
};

const authenticateSocket = async (socket: Socket) => {
  const sessionId = getCookie(
    socket.handshake.headers.cookie,
    "sid",
  );

  if (!sessionId) {
    throw new Error("Authentication is required");
  }

  const userId = await getUserIdFromSession(sessionId);

  if (!userId) {
    throw new Error("Invalid or expired session");
  }

  socket.data.userId = userId;
};

export const initSocket = (httpServer: HttpServer) => {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      await authenticateSocket(socket);
      next();
    } catch (error) {
      next(
        error instanceof Error
          ? error
          : new Error("Authentication failed"),
      );
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    registerChatSocket(socket);

    void (async () => {
      try {
        await socket.join(`user:${userId}`);

        const memberships =
          await prisma.conversationMember.findMany({
            where: { userId },
            select: { conversationId: true },
          });

        const conversationRooms = memberships.map(
          (membership) =>
            `conversation:${membership.conversationId}`,
        );

        await socket.join(conversationRooms);
      } catch (error) {
        console.error("Socket initialization failed:", error);
        socket.disconnect(true);
      }
    })();
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized",
    );
  }

  return io;
};
