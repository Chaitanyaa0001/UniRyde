import { Prisma, type $Enums } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { getIO } from "../../lib/socket.js";
import { AppError } from "../../utils/app-error.js";
import type {CreateCarpoolInput,ListCarpoolsInput,PaginationInput,AcceptRequestInput,RejectRequestInput,RequestActionInput,UpdateCarpoolInput,} from "./carpool.schema.js";
const publicUserSelect = {
  id: true,
  username: true,
  profilePhotoUrl: true,
} satisfies Prisma.UserSelect;

const carpoolInclude = {
  user: { select: publicUserSelect },
  _count: { select: { members: true, requests: true } },
} satisfies Prisma.CarpoolInclude;

const publicCarpoolSelect = {
  id: true,
  userId: true,
  pickupPoint: true,
  destinationPoint: true,
  departureTime: true,
  requiredPeople: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: { select: publicUserSelect },
  _count: { select: { members: true, requests: true } },
} satisfies Prisma.CarpoolSelect;

const withAvailability = <T extends { requiredPeople: number; _count: { members: number } }>(
  carpool: T,
) => ({
  ...carpool,
  acceptedMembersCount: carpool._count.members,
  availableSeats: Math.max(carpool.requiredPeople - 1 - carpool._count.members, 0),
});

const assertFuture = (date: Date) => {
  if (date.getTime() <= Date.now()) {
    throw new AppError(400, "Departure time must be in the future");
  }
};

const assertOwner = (carpool: { userId: string }, userId: string) => {
  if (carpool.userId !== userId) {
    throw new AppError(403, "Only the carpool creator can perform this action");
  }
};

const getCarpoolOrThrow = async (id: string) => {
  const carpool = await prisma.carpool.findUnique({
    where: { id },
    include: carpoolInclude,
  });

  if (!carpool) {
    throw new AppError(404, "Carpool not found");
  }

  return carpool;
};

export const createCarpoolService = async (userId: string,data: CreateCarpoolInput,) => {
  assertFuture(data.departureTime);

  const carpool = await prisma.carpool.create({
    data: {
      userId,
      pickupPoint: data.pickupPoint,
      destinationPoint: data.destinationPoint,
      departureTime: data.departureTime,
      requiredPeople: data.requiredPeople,
      status: "ACTIVE",
    },
    select: publicCarpoolSelect,
  });

  return withAvailability(carpool);
};

export const listCarpoolsService = async (userId: string, data: ListCarpoolsInput) => {
  const now = new Date();
  const startOfDay = data.departureDate
    ? new Date(data.departureDate.getFullYear(), data.departureDate.getMonth(), data.departureDate.getDate())
    : undefined;
  const endOfDay = startOfDay
    ? new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    : undefined;

  const carpools = await prisma.carpool.findMany({
    where: {
      status: "ACTIVE",
      departureTime: {
        gt: now,
        ...(startOfDay && endOfDay
          ? { gte: startOfDay, lt: endOfDay }
          : {}),
      },
      ...(data.pickupPoint && {
        pickupPoint: { contains: data.pickupPoint, mode: "insensitive" },
      }),
      ...(data.destinationPoint && {
        destinationPoint: {
          contains: data.destinationPoint,
          mode: "insensitive",
        },
      }),
      ...(data.search && {
        OR: [
          { pickupPoint: { contains: data.search, mode: "insensitive" } },
          { destinationPoint: { contains: data.search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { departureTime: "asc" },
    select: {
      ...publicCarpoolSelect,
      requests: {
        where: { userId },
        select: { status: true },
        take: 1,
      },
    },
  });

  const filtered = carpools
    .map((carpool) => ({
      ...withAvailability(carpool),
      currentUserRequest: carpool.requests[0] ?? null,
    }))
    .filter(
      (carpool) =>
        data.availableSeats === undefined ||
        carpool.availableSeats >= data.availableSeats,
    );
  const start = (data.page - 1) * data.limit;

  return {
    carpools: filtered.slice(start, start + data.limit),
    pagination: {
      page: data.page,
      limit: data.limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / data.limit),
    },
  };
};

export const deleteCarpoolService = async (
  id: string,
  userId: string,
) => {
  return prisma.$transaction(async (tx) => {
    const carpool = await tx.carpool.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!carpool) {
      throw new AppError(404, "Carpool not found");
    }

    assertOwner(carpool, userId);

    // Delete dependent booking requests.
    await tx.carpoolRequest.deleteMany({
      where: { carpoolId: id },
    });

    // Delete accepted membership records.
    await tx.carpoolMember.deleteMany({
      where: { carpoolId: id },
    });

    // Permanently delete the carpool itself.
    await tx.carpool.delete({
      where: { id },
    });

    return { success: true };
  });
};
export const getCarpoolDetailsService = async (id: string, userId: string) => {
  const carpool = await prisma.carpool.findUnique({
    where: { id },
    select: {
      ...publicCarpoolSelect,
      members: {
        select: { id: true, userId: true, joinedAt: true, user: { select: publicUserSelect } },
      },
      requests: {
        where: { userId },
        select: { id: true, status: true },
      },
    },
  });

  if (!carpool) {
    throw new AppError(404, "Carpool not found");
  }

  return {
    ...withAvailability(carpool),
    currentUserMembership: carpool.members.find((member) => member.userId === userId) ?? null,
    currentUserRequest: carpool.requests[0] ?? null,
  };
};

export const updateCarpoolService = async (
  id: string,
  userId: string,
  data: UpdateCarpoolInput,
) => {
  const carpool = await getCarpoolOrThrow(id);
  assertOwner(carpool, userId);

  if (carpool.status !== "ACTIVE") {
    throw new AppError(409, "Only active carpools can be updated");
  }
  if (data.departureTime) {
    assertFuture(data.departureTime);
  }
  if (data.requiredPeople !== undefined) {
    const participantCount = carpool._count.members + 1;
    if (data.requiredPeople < participantCount) {
      throw new AppError(409, "Capacity cannot be below the current participant count");
    }
  }

  const updated = await prisma.carpool.update({
    where: { id },
    data: {
      ...(data.pickupPoint !== undefined && { pickupPoint: data.pickupPoint }),
      ...(data.destinationPoint !== undefined && {
        destinationPoint: data.destinationPoint,
      }),
      ...(data.departureTime !== undefined && {
        departureTime: data.departureTime,
      }),
      ...(data.requiredPeople !== undefined && {
        requiredPeople: data.requiredPeople,
      }),
    },
  });

  return withAvailability(
    await prisma.carpool.findUniqueOrThrow({
      where: { id: updated.id },
      select: publicCarpoolSelect,
    }),
  );
};

export const cancelCarpoolService = async (id: string, userId: string) => {
  const carpool = await getCarpoolOrThrow(id);
  assertOwner(carpool, userId);

  if (carpool.status !== "ACTIVE") {
    throw new AppError(409, "Carpool is already inactive");
  }

  return prisma.carpool.update({
    where: { id },
    data: { status: "CANCELLED" },
    select: publicCarpoolSelect,
  });
};

export const createJoinRequestService = async (carpoolId: string, userId: string) => {
  const carpool = await prisma.carpool.findUnique({
    where: { id: carpoolId },
    select: { id: true, userId: true, status: true, departureTime: true },
  });

  if (!carpool) throw new AppError(404, "Carpool not found");
  if (carpool.userId === userId) throw new AppError(400, "You cannot join your own carpool");
  if (carpool.status !== "ACTIVE") throw new AppError(409, "Carpool is not active");
  assertFuture(carpool.departureTime);

  const existing = await prisma.carpoolRequest.findUnique({
    where: { carpoolId_userId: { carpoolId, userId } },
  });
  if (existing) throw new AppError(409, "You already requested to join this carpool");

  const member = await prisma.carpoolMember.findUnique({
    where: { carpoolId_userId: { carpoolId, userId } },
  });
  if (member) throw new AppError(409, "You are already a member of this carpool");

  return prisma.carpoolRequest.create({
    data: { carpoolId, userId, status: "PENDING" },
    select: {
      id: true,
      carpoolId: true,
      userId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};


export const listIncomingRequestsService = async (
  carpoolId: string,
  userId: string,
  data: PaginationInput,
) => {
  const carpool = await getCarpoolOrThrow(carpoolId);
  assertOwner(carpool, userId);

  const [requests, total, conversation] = await prisma.$transaction([
    prisma.carpoolRequest.findMany({
      where: { carpoolId },
      orderBy: { createdAt: "desc" },
      skip: (data.page - 1) * data.limit,
      take: data.limit,
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: publicUserSelect,
        },
      },
    }),

    prisma.carpoolRequest.count({
      where: { carpoolId },
    }),

    prisma.conversation.findUnique({
      where: {
        key: `carpool:${carpoolId}`,
      },
      select: {
        id: true,
      },
    }),
  ]);

  const requestsWithConversation = requests.map((request) => ({
    ...request,
    conversationId:
      request.status === "ACCEPTED"
        ? conversation?.id ?? null
        : null,
  }));

  return {
    requests: requestsWithConversation,
    pagination: {
      page: data.page,
      limit: data.limit,
      total,
      totalPages: Math.ceil(total / data.limit),
    },
  };
};


type JoinRequestSummary = {
  id: string;
  carpoolId: string;
  userId: string;
  status: $Enums.CarpoolRequestStatus;
  createdAt: Date;
  updatedAt: Date;
};

type MemberSummary = {
  id: string;
  carpoolId: string;
  userId: string;
  joinedAt: Date;
};

type AcceptedRequestResult = {
  request: JoinRequestSummary;
  member: MemberSummary;
  conversationId: string;
};

type RejectedRequestResult = {
  request: JoinRequestSummary;
};

export function updateJoinRequestService(
  carpoolId: string,
  requestId: string,
  userId: string,
  data: AcceptRequestInput,
): Promise<AcceptedRequestResult>;
export function updateJoinRequestService(
  carpoolId: string,
  requestId: string,
  userId: string,
  data: RejectRequestInput,
): Promise<RejectedRequestResult>;
export function updateJoinRequestService(
  carpoolId: string,
  requestId: string,
  userId: string,
  data: RequestActionInput,
): Promise<AcceptedRequestResult | RejectedRequestResult>;
export function updateJoinRequestService(
  carpoolId: string,
  requestId: string,
  userId: string,
  data: RequestActionInput,
): Promise<AcceptedRequestResult | RejectedRequestResult> {
  return updateJoinRequestTransaction(carpoolId, requestId, userId, data);
}

async function updateJoinRequestTransaction(
  carpoolId: string,
  requestId: string,
  userId: string,
  data: RequestActionInput,
): Promise<AcceptedRequestResult | RejectedRequestResult> {
  const result = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "carpools" WHERE "id" = ${carpoolId} FOR UPDATE`;
    const carpool = await tx.carpool.findUnique({
      where: { id: carpoolId },
      select: { id: true, userId: true, status: true, departureTime: true, requiredPeople: true },
    });
    if (!carpool) throw new AppError(404, "Carpool not found");
    assertOwner(carpool, userId);

    const request = await tx.carpoolRequest.findUnique({
      where: { id: requestId },
      select: { id: true, carpoolId: true, userId: true, status: true },
    });
    if (!request || request.carpoolId !== carpoolId) {
      throw new AppError(404, "Join request not found");
    }
    if (request.status !== "PENDING") {
      throw new AppError(409, "Join request has already been processed");
    }

    if (data.action === "REJECT") {
      const updated = await tx.carpoolRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
        select: { id: true, carpoolId: true, userId: true, status: true, createdAt: true, updatedAt: true },
      });
      return { request: updated };
    }

    if (carpool.status !== "ACTIVE") throw new AppError(409, "Carpool is not active");
    assertFuture(carpool.departureTime);
    const memberCount = await tx.carpoolMember.count({ where: { carpoolId } });
    if (memberCount >= carpool.requiredPeople - 1) {
      throw new AppError(409, "Carpool has no available seats");
    }

    const member = await tx.carpoolMember.create({
      data: { carpoolId, userId: request.userId },
      select: { id: true, carpoolId: true, userId: true, joinedAt: true },
    });
    const updatedRequest = await tx.carpoolRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
      select: { id: true, carpoolId: true, userId: true, status: true, createdAt: true, updatedAt: true },
    });

    const conversation = await tx.conversation.upsert({
      where: { key: `carpool:${carpoolId}` },
      create: { key: `carpool:${carpoolId}` },
      update: {},
      select: { id: true },
    });

    await tx.conversationMember.upsert({
      where: {
        conversationId_userId: {
          conversationId: conversation.id,
          userId: carpool.userId,
        },
      },
      create: {
        conversationId: conversation.id,
        userId: carpool.userId,
      },
      update: {},
    });
    await tx.conversationMember.upsert({
      where: {
        conversationId_userId: {
          conversationId: conversation.id,
          userId: request.userId,
        },
      },
      create: {
        conversationId: conversation.id,
        userId: request.userId,
      },
      update: {},
    });

    return {
      request: updatedRequest,
      member,
      conversationId: conversation.id,
      ownerId: carpool.userId,
      requesterId: request.userId,
    };
  });

  if (!("ownerId" in result)) {
    return result;
  }

  try {
    const io = getIO();
    io.in(`user:${result.ownerId}`).socketsJoin(`conversation:${result.conversationId}`);
    io.in(`user:${result.requesterId}`).socketsJoin(`conversation:${result.conversationId}`);
    io.to(`user:${result.ownerId}`).to(`user:${result.requesterId}`).emit(
      "conversation:created",
      {
        conversationId: result.conversationId,
        carpoolId,
      },
    );
  } catch (error) {
    console.error("Socket emit failed:", error);
  }

  return {
    request: result.request,
    member: result.member,
    conversationId: result.conversationId,
  };
};

export const listMyCreatedCarpoolsService = async (userId: string) => {
  const carpools = await prisma.carpool.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      ...publicCarpoolSelect,
      _count: { select: { members: true, requests: { where: { status: "PENDING" } } } },
    },
  });
  return carpools.map(withAvailability);
};

export const listMyJoinedCarpoolsService = async (userId: string) => {
  const memberships = await prisma.carpoolMember.findMany({
    where: { userId },
    orderBy: { joinedAt: "desc" },
    select: {
      joinedAt: true,
      carpool: { select: { ...publicCarpoolSelect, members: { select: { id: true } } } },
    },
  });
  return memberships.map(({ joinedAt, carpool }) => ({
    ...withAvailability({ ...carpool, _count: { members: carpool.members.length } }),
    joinedAt,
  }));
};

export const listMyRequestsService = async (userId: string) => {
  return prisma.carpoolRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      carpool: {
        select: {
          ...publicCarpoolSelect,
        },
      },
    },
  });
};
