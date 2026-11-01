import * as z from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().trim().min(1).max(2000),
});

export const conversationIdSchema = z.object({
  conversationId: z.string().uuid(),
});

export const messageListSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
