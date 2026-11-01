/*
  Warnings:

  - The values [CANCELLED] on the enum `CarpoolRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CarpoolRequestStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
ALTER TABLE "public"."carpool_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "carpool_requests" ALTER COLUMN "status" TYPE "CarpoolRequestStatus_new" USING ("status"::text::"CarpoolRequestStatus_new");
ALTER TYPE "CarpoolRequestStatus" RENAME TO "CarpoolRequestStatus_old";
ALTER TYPE "CarpoolRequestStatus_new" RENAME TO "CarpoolRequestStatus";
DROP TYPE "public"."CarpoolRequestStatus_old";
ALTER TABLE "carpool_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "carpools" DROP CONSTRAINT "carpools_userId_fkey";

-- AddForeignKey
ALTER TABLE "carpools" ADD CONSTRAINT "carpools_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
