"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle,
  X,
  Users,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "@/context/auth/auth.context";
import {
  getConversations,
  type ChatMessage,
  type Conversation,
} from "@/features/chat/chat.api";
import { connectChatSocket } from "@/features/chat/chat.socket";

import ChatPopup from "./ChatPopup";

type ActiveChat = {
  conversationId: string;
  username: string;
};

type MessagingContextValue = {
  openConversation: (
    conversationId: string,
    username: string,
  ) => void;
};

const MessagingContext =
  createContext<MessagingContextValue | null>(null);

export const useMessaging = () => {
  const context = useContext(MessagingContext);

  if (!context) {
    throw new Error(
      "useMessaging must be used inside MessagingWidget",
    );
  }

  return context;
};

export default function MessagingWidget({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeChat, setActiveChat] =
    useState<ActiveChat | null>(null);

  const [unread, setUnread] = useState<Record<string, number>>(
    {},
  );

  const activeConversationRef = useRef<string | null>(null);

  const conversationsQuery = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: getConversations,
    enabled: Boolean(user?.id),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const conversations =
    conversationsQuery.data?.conversations ?? [];

  const unreadTotal = Object.values(unread).reduce(
    (total, count) => total + count,
    0,
  );

  const openConversation = useCallback(
    (conversationId: string, username: string) => {
      activeConversationRef.current = conversationId;

      setUnread((current) => ({
        ...current,
        [conversationId]: 0,
      }));

      setActiveChat({
        conversationId,
        username,
      });

      setPanelOpen(false);
    },
    [],
  );

  const closeChat = useCallback(() => {
    activeConversationRef.current = null;
    setActiveChat(null);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      activeConversationRef.current = null;
      setActiveChat(null);
      setUnread({});
      return;
    }

    const socket = connectChatSocket();

    const refreshConversations = () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "conversations"],
      });
    };

    const onMessage = (message: ChatMessage) => {
      refreshConversations();

      queryClient.invalidateQueries({
        queryKey: [
          "chat",
          message.conversationId,
          "messages",
        ],
      });

      if (
        message.senderId === user.id ||
        activeConversationRef.current === message.conversationId
      ) {
        return;
      }

      setUnread((current) => ({
        ...current,
        [message.conversationId]:
          (current[message.conversationId] ?? 0) + 1,
      }));
    };

    const onConversationCreated = () => {
      refreshConversations();
    };

    socket.on("message:new", onMessage);
    socket.on("conversation:created", onConversationCreated);
    socket.on("connect", refreshConversations);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("message:new", onMessage);
      socket.off(
        "conversation:created",
        onConversationCreated,
      );
      socket.off("connect", refreshConversations);
    };
  }, [user?.id, queryClient]);

  const contextValue = useMemo(
    () => ({ openConversation }),
    [openConversation],
  );

  const getOtherMember = (conversation: Conversation) =>
    conversation.members.find(
      (member) => member.id !== user?.id,
    );

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}

      {user?.id && (
        <>
          {/* Floating messages launcher */}
          <button
            type="button"
            onClick={() => setPanelOpen((value) => !value)}
            aria-label="Open messages"
            className="fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#009F9F] text-white shadow-xl transition hover:bg-[#008888]"
          >
            {panelOpen ? (
              <X size={25} />
            ) : (
              <MessageCircle size={25} />
            )}

            {unreadTotal > 0 && !panelOpen && (
              <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-xs font-bold text-white">
                {unreadTotal > 99 ? "99+" : unreadTotal}
              </span>
            )}
          </button>

          {/* Conversation list */}
          {panelOpen && (
            <div className="fixed bottom-24 right-5 z-[90] flex h-[min(560px,calc(100vh-130px))] w-[min(370px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between bg-[#009F9F] px-5 py-4 text-white">
                <div>
                  <h2 className="font-semibold">Messages</h2>
                  <p className="text-xs text-white/80">
                    Your carpool conversations
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Close messages"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversationsQuery.isLoading && (
                  <p className="p-8 text-center text-sm text-gray-500">
                    Loading conversations...
                  </p>
                )}

                {conversationsQuery.isError && (
                  <div className="p-6 text-center">
                    <p className="text-sm text-red-500">
                      Could not load your conversations.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        void conversationsQuery.refetch()
                      }
                      className="mt-3 text-sm font-semibold text-[#009F9F]"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!conversationsQuery.isLoading &&
                  !conversationsQuery.isError &&
                  conversations.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-[#009F9F]">
                        <MessageCircle size={30} />
                      </div>

                      <h3 className="font-semibold text-gray-800">
                        No chats yet
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        When a carpool owner accepts your request,
                        your conversation will appear here.
                      </p>
                    </div>
                  )}

                {conversations.map((conversation) => {
                  const other = getOtherMember(conversation);

                  const title =
                    other?.username ??
                    (conversation.carpool
                      ? "Carpool group"
                      : "Conversation");

                  const unreadCount =
                    unread[conversation.id] ?? 0;

                  return (
                    <button
                      type="button"
                      key={conversation.id}
                      onClick={() =>
                        openConversation(
                          conversation.id,
                          title,
                        )
                      }
                      className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-4 text-left transition hover:bg-gray-50"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[#009F9F]">
                        <Users size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {title}
                          </p>

                          {unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                              {unreadCount}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {conversation.lastMessage?.content ??
                            (conversation.carpool
                              ? `${conversation.carpool.pickupPoint} → ${conversation.carpool.destinationPoint}`
                              : "Start a conversation")}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active chat popup */}
          {activeChat && (
            <ChatPopup
              conversationId={activeChat.conversationId}
              username={activeChat.username}
              onClose={closeChat}
            />
          )}
        </>
      )}
    </MessagingContext.Provider>
  );
}