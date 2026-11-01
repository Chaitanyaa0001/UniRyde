import { apiRequest } from "@/lib/api";
import type { PublicUser } from "../carpools/carpools.types";

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string | null;
  content: string | null;
  imageUrl: string | null;
  imageId: string | null;
  createdAt: string;
  updatedAt: string;
  sender: PublicUser | null;
};

export type Conversation = {
  id: string;
  key: string;
  createdAt: string;
  updatedAt: string;
  members: PublicUser[];
  carpool: {
    id: string;
    pickupPoint: string;
    destinationPoint: string;
    departureTime: string;
    status: string;
  } | null;
  lastMessage: ChatMessage | null;
};

export const getConversations = () =>
  apiRequest<{ conversations: Conversation[] }>("/chat/conversations");

export const getMessages = (conversationId: string) =>
  apiRequest<{
    messages: ChatMessage[];
    nextCursor: string | null;
  }>(`/chat/conversations/${conversationId}/messages?limit=50`);