"use client";

import { io, type Socket } from "socket.io-client";
import type { ChatMessage } from "./chat.api";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5050/api/v1";

const socketUrl =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  new URL(apiUrl).origin;

let socket: Socket | null = null;

export type SocketAck =
  | { ok: true; data?: unknown }
  | { ok: false; error: string };

export const getChatSocket = (): Socket => {
  if (!socket) {
    socket = io(socketUrl, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }

  return socket;
};

export const connectChatSocket = (): Socket => {
  const currentSocket = getChatSocket();

  if (!currentSocket.connected) {
    currentSocket.connect();
  }

  return currentSocket;
};

export const disconnectChatSocket = (): void => {
  socket?.disconnect();
};

export type MessageEvent = (message: ChatMessage) => void;