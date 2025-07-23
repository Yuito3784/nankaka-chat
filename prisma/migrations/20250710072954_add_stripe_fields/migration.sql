/*
  Warnings:

  - You are about to drop the column `stripeSubscriptionId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripeSubId" TEXT;
