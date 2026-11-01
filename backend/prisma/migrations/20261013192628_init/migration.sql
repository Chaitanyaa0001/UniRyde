-- CreateEnum
CREATE TYPE "CarpoolRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CarpoolStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilePhotoUrl" TEXT,
    "profilePhotoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carpools" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pickupPoint" TEXT NOT NULL,
    "destinationPoint" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "requiredPeople" INTEGER NOT NULL,
    "status" "CarpoolStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carpools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carpool_requests" (
    "id" TEXT NOT NULL,
    "carpoolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CarpoolRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carpool_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carpool_members" (
    "id" TEXT NOT NULL,
    "carpoolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carpool_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_members" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "content" TEXT,
    "imageUrl" TEXT,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "carpools_userId_idx" ON "carpools"("userId");

-- CreateIndex
CREATE INDEX "carpools_departureTime_idx" ON "carpools"("departureTime");

-- CreateIndex
CREATE INDEX "carpools_createdAt_idx" ON "carpools"("createdAt");

-- CreateIndex
CREATE INDEX "carpool_requests_carpoolId_status_idx" ON "carpool_requests"("carpoolId", "status");

-- CreateIndex
CREATE INDEX "carpool_requests_userId_idx" ON "carpool_requests"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "carpool_requests_carpoolId_userId_key" ON "carpool_requests"("carpoolId", "userId");

-- CreateIndex
CREATE INDEX "carpool_members_userId_idx" ON "carpool_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "carpool_members_carpoolId_userId_key" ON "carpool_members"("carpoolId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_key_key" ON "conversations"("key");

-- CreateIndex
CREATE INDEX "conversation_members_userId_idx" ON "conversation_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_members_conversationId_userId_key" ON "conversation_members"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- AddForeignKey
ALTER TABLE "carpools" ADD CONSTRAINT "carpools_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpool_requests" ADD CONSTRAINT "carpool_requests_carpoolId_fkey" FOREIGN KEY ("carpoolId") REFERENCES "carpools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpool_requests" ADD CONSTRAINT "carpool_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpool_members" ADD CONSTRAINT "carpool_members_carpoolId_fkey" FOREIGN KEY ("carpoolId") REFERENCES "carpools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpool_members" ADD CONSTRAINT "carpool_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
