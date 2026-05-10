-- CreateEnum
CREATE TYPE "HousingStatus" AS ENUM ('RENTER', 'HOMEOWNER', 'LIVING_WITH_OTHERS', 'OTHER_HOUSING');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED_LOOKING', 'UNEMPLOYED_NOT_LOOKING', 'STUDENT', 'RETIRED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employmentStatus" "EmploymentStatus",
ADD COLUMN     "housingStatus" "HousingStatus";
