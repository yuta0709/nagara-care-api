-- CreateEnum
CREATE TYPE "MealTime" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- CreateEnum
CREATE TYPE "BeverageType" AS ENUM ('WATER', 'TEA', 'OTHER');

-- CreateEnum
CREATE TYPE "DailyStatus" AS ENUM ('NORMAL', 'WARNING', 'ALERT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('GLOBAL_ADMIN', 'TENANT_ADMIN', 'CAREGIVER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "Tenant" (
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "User" (
    "uid" TEXT NOT NULL,
    "loginId" TEXT NOT NULL,
    "passwordDigest" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyNameFurigana" TEXT NOT NULL,
    "givenNameFurigana" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "tenantUid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Resident" (
    "uid" TEXT NOT NULL,
    "tenantUid" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyNameFurigana" TEXT NOT NULL,
    "givenNameFurigana" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resident_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "FoodRecord" (
    "uid" TEXT NOT NULL,
    "tenantUid" TEXT NOT NULL,
    "caregiverUid" TEXT NOT NULL,
    "residentUid" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "mealTime" "MealTime" NOT NULL,
    "mainCoursePercentage" INTEGER NOT NULL,
    "sideDishPercentage" INTEGER NOT NULL,
    "soupPercentage" INTEGER NOT NULL,
    "beverageType" "BeverageType" NOT NULL,
    "beverageVolume" INTEGER NOT NULL,

    CONSTRAINT "FoodRecord_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "BathRecord" (
    "uid" TEXT NOT NULL,
    "tenantUid" TEXT NOT NULL,
    "caregiverUid" TEXT NOT NULL,
    "residentUid" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "bathMethod" TEXT NOT NULL,

    CONSTRAINT "BathRecord_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "BeverageRecord" (
    "uid" TEXT NOT NULL,
    "tenantUid" TEXT NOT NULL,
    "caregiverUid" TEXT NOT NULL,
    "residentUid" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "beverageType" "BeverageType" NOT NULL,
    "volume" INTEGER NOT NULL,

    CONSTRAINT "BeverageRecord_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "EliminationRecord" (
    "uid" TEXT NOT NULL,
    "tenantUid" TEXT NOT NULL,
    "caregiverUid" TEXT NOT NULL,
    "residentUid" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "eliminationMethod" TEXT NOT NULL,
    "hasFeces" BOOLEAN NOT NULL,
    "fecalIncontinence" BOOLEAN,
    "fecesAppearance" TEXT,
    "fecesVolume" INTEGER,
    "hasUrine" BOOLEAN NOT NULL,
    "urinaryIncontinence" BOOLEAN,
    "urineAppearance" TEXT,
    "urineVolume" INTEGER,

    CONSTRAINT "EliminationRecord_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "DailyRecord" (
    "uid" TEXT NOT NULL,
    "tenantUid" TEXT NOT NULL,
    "caregiverUid" TEXT NOT NULL,
    "residentUid" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "dailyStatus" "DailyStatus",

    CONSTRAINT "DailyRecord_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_loginId_key" ON "User"("loginId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodRecord" ADD CONSTRAINT "FoodRecord_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodRecord" ADD CONSTRAINT "FoodRecord_caregiverUid_fkey" FOREIGN KEY ("caregiverUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodRecord" ADD CONSTRAINT "FoodRecord_residentUid_fkey" FOREIGN KEY ("residentUid") REFERENCES "Resident"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BathRecord" ADD CONSTRAINT "BathRecord_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BathRecord" ADD CONSTRAINT "BathRecord_caregiverUid_fkey" FOREIGN KEY ("caregiverUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BathRecord" ADD CONSTRAINT "BathRecord_residentUid_fkey" FOREIGN KEY ("residentUid") REFERENCES "Resident"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeverageRecord" ADD CONSTRAINT "BeverageRecord_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeverageRecord" ADD CONSTRAINT "BeverageRecord_caregiverUid_fkey" FOREIGN KEY ("caregiverUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeverageRecord" ADD CONSTRAINT "BeverageRecord_residentUid_fkey" FOREIGN KEY ("residentUid") REFERENCES "Resident"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminationRecord" ADD CONSTRAINT "EliminationRecord_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminationRecord" ADD CONSTRAINT "EliminationRecord_caregiverUid_fkey" FOREIGN KEY ("caregiverUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminationRecord" ADD CONSTRAINT "EliminationRecord_residentUid_fkey" FOREIGN KEY ("residentUid") REFERENCES "Resident"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_caregiverUid_fkey" FOREIGN KEY ("caregiverUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_residentUid_fkey" FOREIGN KEY ("residentUid") REFERENCES "Resident"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
