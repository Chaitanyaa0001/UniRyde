import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
const publicUserSelect = {
    id: true,
    username: true,
    profilePhotoUrl: true,
};
const messageSelect = {
    id: true,
    conversationId: true,
    senderId: true,
    content: true,
    imageUrl: true,
    imageId: true,
    createdAt: true,
    updatedAt: true,
    sender: { select: publicUserSelect },
};
const assertMembership = async (conversationId, userId) => {
    const membership = await prisma.conversationMember.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
    });
    if (!membership)
        throw new AppError(403, "You are not a member of this conversation");
};
const getCarpoolId = (key) => key.startsWith("carpool:") ? key.slice("carpool:".length) : undefined;
export const createMessageService = async (userId, data) => {
    await assertMembership(data.conversationId, userId);
    const conversation = await prisma.conversation.findUnique({
        where: { id: data.conversationId },
        select: { id: true, key: true },
    });
    if (!conversation)
        throw new AppError(404, "Conversation not found");
    return prisma.$transaction(async (tx) => {
        const carpoolId = getCarpoolId(conversation.key);
        if (carpoolId) {
            await tx.$queryRaw `SELECT "id" FROM "carpools" WHERE "id" = ${carpoolId} FOR SHARE`;
            const carpool = await tx.carpool.findUnique({
                where: { id: carpoolId },
                select: { status: true },
            });
            if (carpool?.status === "CANCELLED") {
                throw new AppError(409, "Cannot send messages in a cancelled carpool");
            }
        }
        const message = await tx.message.create({
            data: {
                conversationId: data.conversationId,
                senderId: userId,
                content: data.content,
            },
            select: messageSelect,
        });
        await tx.conversation.update({
            where: { id: data.conversationId },
            data: { updatedAt: new Date() },
        });
        return message;
    });
};
export const listConversationsService = async (userId) => {
    const conversations = await prisma.conversation.findMany({
        where: { members: { some: { userId } } },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            key: true,
            createdAt: true,
            updatedAt: true,
            members: { select: { user: { select: publicUserSelect } } },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: messageSelect,
            },
        },
    });
    const carpoolIds = conversations
        .map(({ key }) => getCarpoolId(key))
        .filter((id) => Boolean(id));
    const carpools = await prisma.carpool.findMany({
        where: { id: { in: carpoolIds } },
        select: {
            id: true,
            pickupPoint: true,
            destinationPoint: true,
            departureTime: true,
            status: true,
        },
    });
    const carpoolById = new Map(carpools.map((carpool) => [carpool.id, carpool]));
    return conversations.map(({ key, messages, ...conversation }) => ({
        ...conversation,
        key,
        carpool: getCarpoolId(key) ? carpoolById.get(getCarpoolId(key)) ?? null : null,
        members: conversation.members.map(({ user }) => user),
        lastMessage: messages[0] ?? null,
    }));
};
export const listMessagesService = async (conversationId, userId, cursor, limit) => {
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { id: true },
    });
    if (!conversation)
        throw new AppError(404, "Conversation not found");
    await assertMembership(conversationId, userId);
    if (cursor) {
        const cursorMessage = await prisma.message.findUnique({
            where: { id: cursor },
            select: { id: true, conversationId: true },
        });
        if (!cursorMessage || cursorMessage.conversationId !== conversationId) {
            throw new AppError(400, "Invalid message cursor");
        }
    }
    const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        take: limit + 1,
        select: messageSelect,
    });
    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, limit) : messages;
    return {
        messages: page,
        nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
    };
};
//# sourceMappingURL=chat.service.js.map