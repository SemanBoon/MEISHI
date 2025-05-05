-- AlterTable
ALTER TABLE "BusinessCard" ADD COLUMN     "bannerImageUrl" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "gradient" TEXT,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "projects" TEXT,
ALTER COLUMN "jobTitle" DROP NOT NULL,
ALTER COLUMN "companyName" DROP NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "customBio" DROP NOT NULL;
