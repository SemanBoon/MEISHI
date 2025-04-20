-- AlterTable
ALTER TABLE "BusinessCard" ALTER COLUMN "phoneNumber" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "birthday" DROP NOT NULL;
