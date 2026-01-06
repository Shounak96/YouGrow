-- AlterTable
ALTER TABLE "User" ADD COLUMN "emailChangeExpires" DATETIME;
ALTER TABLE "User" ADD COLUMN "emailChangeToken" TEXT;
ALTER TABLE "User" ADD COLUMN "pendingEmail" TEXT;
