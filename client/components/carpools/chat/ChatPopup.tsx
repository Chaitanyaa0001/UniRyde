"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Send, UserRound, X } from "lucide-react";

import { useAuth } from "@/context/auth/auth.context";
import { getMessages } from "@/features/chat/chat.api";
import { connectChatSocket } from "@/features/chat/chat.socket";
import type {
  ChatMessage,
} from "@/features/chat/chat.api";
import type {
  SocketAck,
} from "@/features/chat/chat.socket";

type Props = {
  conversationId: string;
  username: string;
  onClose: () => void;
};

export default function ChatPopup({
  conversationId,
  username,
  onClose,
}: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [sending, setSending] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);

  const history = useQuery({
    queryKey: ["chat", conversationId, "messages"],
    queryFn: () => getMessages(conversationId),
    enabled: Boolean(conversationId),
    refetchOnWindowFocus: true,
  });

  const joinConversation = useCallback(() => {
    const socket = connectChatSocket();

    socket.emit(
      "conversation:join",
      { conversationId },
      (response: SocketAck) => {
        if (!response.ok) {
          setJoined(false);
          setError(response.error || "Unable to join this conversation.");
          return;
        }

        setJoined(true);
        setError("");
      },
    );
  }, [conversationId]);

  useEffect(() => {
    const socket = connectChatSocket();

    const onConnect = () => {
      setJoined(false);
      joinConversation();
    };

    const onDisconnect = () => {
      setJoined(false);
    };

    const onMessage = (incoming: ChatMessage) => {
      if (incoming.conversationId !== conversationId) return;

      setLiveMessages((current) => {
        if (current.some((item) => item.id === incoming.id)) {
          return current;
        }

        return [...current, incoming];
      });

      queryClient.invalidateQueries({
        queryKey: ["chat", conversationId, "messages"],
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message:new", onMessage);

    if (socket.connected) {
      joinConversation();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message:new", onMessage);
    };
  }, [conversationId, joinConversation, queryClient]);

  useEffect(() => {
    setLiveMessages([]);
    setJoined(false);
    setError("");

    void history.refetch();
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [history.data, liveMessages, minimized]);

  const historicalMessages = [
    ...(history.data?.messages ?? []),
  ].reverse();

  const messages = [
    ...historicalMessages,
    ...liveMessages,
  ]
    .filter((item) => item.conversationId === conversationId)
    .filter(
      (item, index, current) =>
        current.findIndex(
          (entry) => entry.id === item.id,
        ) === index,
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );

  const send = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = message.trim();

    if (!content || !joined || sending) return;

    setError("");
    setSending(true);

    const socket = connectChatSocket();

    socket.emit(
      "message:send",
      { conversationId, content },
      (response: SocketAck) => {
        setSending(false);

        if (!response.ok) {
          setError(response.error || "Unable to send message.");
          return;
        }

        setMessage("");
        queryClient.invalidateQueries({
          queryKey: ["chat", conversationId, "messages"],
        });
        queryClient.invalidateQueries({
          queryKey: ["chat", "conversations"],
        });
      },
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex w-[min(420px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-[#009F9F] px-5 py-4 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <UserRound size={22} />

          <div className="min-w-0">
            <p className="truncate font-semibold">
              {username}
            </p>
            <p className="text-xs text-white/80">
              {joined ? "Connected" : "Connecting..."}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setMinimized((value) => !value)}
            aria-label="Minimize chat"
          >
            <Minus size={21} />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X size={21} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="flex h-[420px] flex-col gap-3 overflow-y-auto bg-[#F7FAFA] p-5">
            {history.isLoading && (
              <p className="m-auto text-sm text-gray-500">
                Loading messages...
              </p>
            )}

            {history.isError && (
              <div className="m-auto text-center">
                <p className="text-sm text-red-500">
                  Could not load messages.
                </p>

                <button
                  type="button"
                  onClick={() => void history.refetch()}
                  className="mt-2 text-sm font-semibold text-[#009F9F]"
                >
                  Try again
                </button>
              </div>
            )}

            {!history.isLoading &&
              !history.isError &&
              messages.length === 0 && (
                <p className="m-auto text-sm text-gray-500">
                  Your conversation starts here.
                </p>
              )}

            {messages.map((item) => {
              const mine = item.senderId === user?.id;

              return (
                <div
                  key={item.id}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    mine
                      ? "ml-auto bg-[#009F9F] text-white"
                      : "mr-auto bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  <p className="break-words text-sm">
                    {item.content}
                  </p>

                  <p className="mt-1 text-right text-[11px] opacity-70">
                    {new Date(item.createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              );
            })}

            <div ref={endRef} />
          </div>

          {error && (
            <p className="px-4 pt-2 text-xs text-red-500">
              {error}
            </p>
          )}

          <form
            onSubmit={send}
            className="flex items-center gap-3 border-t border-gray-200 bg-white p-4"
          >
            <input
  type="text"
  maxLength={2000}
  value={message}
  onChange={(event) => setMessage(event.target.value)}
  placeholder={
    joined
      ? "Type a message..."
      : "Connecting to chat..."
  }
  disabled={!joined || sending}
  className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-100 px-4 text-sm !text-gray-900 placeholder:!text-gray-500 caret-gray-900 outline-none focus:border-[#009F9F] disabled:opacity-60"
/>

            <button
              type="submit"
              disabled={!message.trim() || !joined || sending}
              aria-label="Send message"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#009F9F] text-white disabled:opacity-50"
            >
              <Send size={19} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}