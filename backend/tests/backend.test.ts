import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const mocks = vi.hoisted(() => {
  const prisma = {
    conversation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    conversationMember: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    message: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    carpool: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    carpoolMember: {
      count: vi.fn(),
      create: vi.fn(),
    },
    carpoolRequest: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  };
  const redis = { get: vi.fn() };
  const io = {
    in: vi.fn(() => ({ socketsJoin: vi.fn() })),
    to: vi.fn(() => ({ to: vi.fn(() => ({ emit: vi.fn() })), emit: vi.fn() })),
  };
  return { prisma, redis, io };
});

vi.mock("../src/lib/prisma.js", () => ({ prisma: mocks.prisma }));
vi.mock("../src/lib/redis.js", () => ({ redis: mocks.redis }));
vi.mock("../src/lib/socket.js", () => ({
  getIO: () => mocks.io,
  initSocket: vi.fn(),
}));

const { app } = await import("../src/app.js").then((module) => ({
  app: module.default,
}));
const chatService = await import("../src/modules/chat/chat.service.js");
const chatSocket = await import("../src/modules/chat/chat.socket.js");
const carpoolService = await import("../src/modules/carpools/carpool.service.js");

const userId = "11111111-1111-4111-8111-111111111111";
const otherUserId = "22222222-2222-4222-8222-222222222222";
const conversationId = "33333333-3333-4333-8333-333333333333";
const carpoolId = "44444444-4444-4444-8444-444444444444";
const messageId = "55555555-5555-4555-8555-555555555555";

const publicUser = {
  id: userId,
  username: "owner",
  profilePhotoUrl: null,
};

const message = {
  id: messageId,
  conversationId,
  senderId: userId,
  content: "Hello",
  imageUrl: null,
  imageId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  sender: publicUser,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.redis.get.mockResolvedValue(userId);
  mocks.prisma.conversationMember.findUnique.mockResolvedValue({ id: "membership" });
});

describe("chat REST API", () => {
  it("rejects requests without a valid session", async () => {
    mocks.redis.get.mockResolvedValue(null);

    const response = await request(app).get("/api/v1/chat/conversations");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Authentication is required" });
  });

  it("lists only the authenticated user's conversations with public members and carpool data", async () => {
    mocks.prisma.conversation.findMany.mockResolvedValue([
      {
        id: conversationId,
        key: `carpool:${carpoolId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [{ user: publicUser }],
        messages: [message],
      },
    ]);
    mocks.prisma.carpool.findMany.mockResolvedValue([
      {
        id: carpoolId,
        pickupPoint: "Campus",
        destinationPoint: "Home",
        departureTime: new Date(),
        status: "ACTIVE",
      },
    ]);

    const response = await request(app)
      .get("/api/v1/chat/conversations")
      .set("Cookie", "sid=session-id");

    expect(response.status).toBe(200);
    expect(response.body.conversations[0]).toMatchObject({
      id: conversationId,
      carpool: { id: carpoolId, pickupPoint: "Campus" },
      members: [publicUser],
      lastMessage: { id: messageId, sender: publicUser },
    });
    expect(response.body.conversations[0].members[0].email).toBeUndefined();
  });

  it("enforces membership and returns cursor-paginated messages", async () => {
    mocks.prisma.conversation.findUnique.mockResolvedValue({ id: conversationId });
    mocks.prisma.message.findMany.mockResolvedValue([message]);

    const response = await request(app)
      .get(`/api/v1/chat/conversations/${conversationId}/messages?limit=30`)
      .set("Cookie", "sid=session-id");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ messages: [expect.objectContaining({ id: messageId })], nextCursor: null });
    expect(mocks.prisma.conversationMember.findUnique).toHaveBeenCalledWith({
      where: { conversationId_userId: { conversationId, userId } },
    });
  });

  it("returns 404 for a missing conversation", async () => {
    mocks.prisma.conversation.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/v1/chat/conversations/${conversationId}/messages`)
      .set("Cookie", "sid=session-id");

    expect(response.status).toBe(404);
  });

  it("returns 400 for a cursor from another conversation", async () => {
    mocks.prisma.conversation.findUnique.mockResolvedValue({ id: conversationId });
    mocks.prisma.message.findUnique.mockResolvedValue({
      id: messageId,
      conversationId: "66666666-6666-4666-8666-666666666666",
    });

    const response = await request(app)
      .get(`/api/v1/chat/conversations/${conversationId}/messages?cursor=${messageId}`)
      .set("Cookie", "sid=session-id");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Invalid message cursor" });
  });
});

describe("chat services and socket handlers", () => {
  it("rejects non-members before creating a message", async () => {
    mocks.prisma.conversationMember.findUnique.mockResolvedValue(null);

    await expect(
      chatService.createMessageService(userId, { conversationId, content: "Hello" }),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.prisma.message.create).not.toHaveBeenCalled();
  });

  it("rejects messages for cancelled carpools inside the transaction", async () => {
    mocks.prisma.conversation.findUnique.mockResolvedValue({
      id: conversationId,
      key: `carpool:${carpoolId}`,
    });
    const tx = {
      $queryRaw: vi.fn(),
      carpool: { findUnique: vi.fn().mockResolvedValue({ status: "CANCELLED" }) },
      message: { create: vi.fn() },
      conversation: { update: vi.fn() },
    };
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(
      chatService.createMessageService(userId, { conversationId, content: "Hello" }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(tx.message.create).not.toHaveBeenCalled();
  });

  it("validates membership and broadcasts a new message with an acknowledgement", async () => {
    mocks.prisma.conversation.findUnique.mockResolvedValue({
      id: conversationId,
      key: "direct:conversation",
    });
    const tx = {
      message: { create: vi.fn().mockResolvedValue(message) },
      conversation: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    const handlers = new Map<string, (...args: unknown[]) => Promise<void>>();
    const emit = vi.fn();
    const socket = {
      data: { userId },
      on: (event: string, handler: (...args: unknown[]) => Promise<void>) =>
        handlers.set(event, handler),
      nsp: { to: vi.fn(() => ({ emit })) },
      to: vi.fn(() => ({ emit })),
      join: vi.fn(),
    };
    chatSocket.registerChatSocket(socket as never);
    const ack = vi.fn();

    await handlers.get("message:send")?.(
      { conversationId, content: " Hello " },
      ack,
    );

    expect(ack).toHaveBeenCalledWith({ ok: true, data: message });
    expect(emit).toHaveBeenCalledWith("message:new", message);
  });

  it("rejects invalid socket payloads through the acknowledgement", async () => {
    const handlers = new Map<string, (...args: unknown[]) => Promise<void>>();
    const socket = {
      data: { userId },
      on: (event: string, handler: (...args: unknown[]) => Promise<void>) =>
        handlers.set(event, handler),
      nsp: { to: vi.fn() },
      to: vi.fn(),
      join: vi.fn(),
    };
    chatSocket.registerChatSocket(socket as never);
    const ack = vi.fn();

    await handlers.get("message:send")?.({ content: "" }, ack);

    expect(ack).toHaveBeenCalledWith({ ok: false, error: "Validation failed" });
  });
});

describe("carpool acceptance chat integration", () => {
  it("creates an idempotent conversation and both memberships in the acceptance transaction", async () => {
    const tx = {
      $queryRaw: vi.fn(),
      carpool: {
        findUnique: vi.fn().mockResolvedValue({
          id: carpoolId,
          userId,
          status: "ACTIVE",
          departureTime: new Date(Date.now() + 60_000),
          requiredPeople: 3,
        }),
      },
      carpoolRequest: {
        findUnique: vi.fn().mockResolvedValue({
          id: "request-id",
          carpoolId,
          userId: otherUserId,
          status: "PENDING",
        }),
        update: vi.fn().mockResolvedValue({
          id: "request-id",
          carpoolId,
          userId: otherUserId,
          status: "ACCEPTED",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
      carpoolMember: {
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn().mockResolvedValue({
          id: "member-id",
          carpoolId,
          userId: otherUserId,
          joinedAt: new Date(),
        }),
      },
      conversation: {
        upsert: vi.fn().mockResolvedValue({ id: conversationId }),
      },
      conversationMember: {
        upsert: vi.fn().mockResolvedValue({}),
      },
    };
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    const result = await carpoolService.updateJoinRequestService(
      carpoolId,
      "request-id",
      userId,
      { action: "ACCEPT" },
    );

    expect(result.conversationId).toBe(conversationId);
    expect(tx.conversation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { key: `carpool:${carpoolId}` } }),
    );
    expect(tx.conversationMember.upsert).toHaveBeenCalledTimes(2);
    expect(mocks.io.in).toHaveBeenCalled();
  });
});
