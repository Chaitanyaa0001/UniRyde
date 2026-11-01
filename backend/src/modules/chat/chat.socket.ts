import type { Socket } from "socket.io";
import * as z from "zod";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { createMessageService } from "./chat.service.js";
import { conversationIdSchema, sendMessageSchema } from "./chat.schema.js";

type Ack = (
  response: { ok: true; data: unknown } | { ok: false; error: string },
) => void;

const typingSchema = conversationIdSchema;
const messageTimes = new Map<string, number[]>();

const acknowledge = (ack: Ack | undefined, response: Parameters<Ack>[0]) => {
  ack?.(response);
};

const ackError = (ack: Ack | undefined, error: unknown) => {
  if (error instanceof z.ZodError) {
    acknowledge(ack, { ok: false, error: "Validation failed" });
    return;
  }
  acknowledge(ack, {
    ok: false,
    error: error instanceof AppError ? error.message : "Internal server error",
  });
};

const isMember = async (conversationId: string, userId: string) => {
  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!membership) throw new AppError(403, "You are not a member of this conversation");
};

const checkRateLimit = (userId: string) => {
  const now = Date.now();
  const recent = (messageTimes.get(userId) ?? []).filter((time) => now - time < 10_000);
  if (recent.length >= 10) throw new AppError(429, "Message rate limit exceeded");
  recent.push(now);
  messageTimes.set(userId, recent);
};

export const registerChatSocket = (socket: Socket) => {
  const userId = socket.data.userId as string;

  socket.on("message:send", async (payload: unknown, ack?: Ack) => {
    try {
      checkRateLimit(userId);
      const data = sendMessageSchema.parse(payload);
      const message = await createMessageService(userId, data);
      socket.nsp.to(`conversation:${data.conversationId}`).emit("message:new", message);
      acknowledge(ack, { ok: true, data: message });
    } catch (error) {
      ackError(ack, error);
    }
  });

  const handleTyping = async (
    event: "typing:start" | "typing:stop",
    payload: unknown,
    ack: Ack | undefined,
  ) => {
    try {
      const { conversationId } = typingSchema.parse(payload);
      await isMember(conversationId, userId);
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        userId,
        action: event === "typing:start" ? "start" : "stop",
      });
      acknowledge(ack, { ok: true, data: { conversationId } });
    } catch (error) {
      ackError(ack, error);
    }
  };

  socket.on("typing:start", (payload: unknown, ack?: Ack) =>
    handleTyping("typing:start", payload, ack),
  );
  socket.on("typing:stop", (payload: unknown, ack?: Ack) =>
    handleTyping("typing:stop", payload, ack),
  );

  socket.on("conversation:join", async (payload: unknown, ack?: Ack) => {
    try {
      const { conversationId } = conversationIdSchema.parse(payload);
      await isMember(conversationId, userId);
      socket.join(`conversation:${conversationId}`);
      acknowledge(ack, { ok: true, data: { conversationId } });
    } catch (error) {
      ackError(ack, error);
    }
  });

  socket.on("disconnect", () => {
    messageTimes.delete(userId);
  });
};
