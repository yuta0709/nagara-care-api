-- DropForeignKey
ALTER TABLE "BathRecord" DROP CONSTRAINT "BathRecord_caregiverUid_fkey";

-- DropForeignKey
ALTER TABLE "BathRecord" DROP CONSTRAINT "BathRecord_residentUid_fkey";

-- DropForeignKey
ALTER TABLE "BathRecord" DROP CONSTRAINT "BathRecord_tenantUid_fkey";

-- DropForeignKey
ALTER TABLE "BeverageRecord" DROP CONSTRAINT "BeverageRecord_caregiverUid_fkey";

-- DropForeignKey
ALTER TABLE "BeverageRecord" DROP CONSTRAINT "BeverageRecord_residentUid_fkey";

-- DropForeignKey
ALTER TABLE "BeverageRecord" DROP CONSTRAINT "BeverageRecord_tenantUid_fkey";

-- DropForeignKey
ALTER TABLE "DailyRecord" DROP CONSTRAINT "DailyRecord_caregiverUid_fkey";

-- DropForeignKey
ALTER TABLE "DailyRecord" DROP CONSTRAINT "DailyRecord_residentUid_fkey";

-- DropForeignKey
ALTER TABLE "DailyRecord" DROP CONSTRAINT "DailyRecord_tenantUid_fkey";

-- DropForeignKey
ALTER TABLE "EliminationRecord" DROP CONSTRAINT "EliminationRecord_caregiverUid_fkey";

-- DropForeignKey
ALTER TABLE "EliminationRecord" DROP CONSTRAINT "EliminationRecord_residentUid_fkey";

-- DropForeignKey
ALTER TABLE "EliminationRecord" DROP CONSTRAINT "EliminationRecord_tenantUid_fkey";

-- DropForeignKey
ALTER TABLE "FoodRecord" DROP CONSTRAINT "FoodRecord_caregiverUid_fkey";

-- DropForeignKey
ALTER TABLE "FoodRecord" DROP CONSTRAINT "FoodRecord_residentUid_fkey";

-- DropForeignKey
ALTER TABLE "FoodRecord" DROP CONSTRAINT "FoodRecord_tenantUid_fkey";

-- DropForeignKey
ALTER TABLE "Resident" DROP CONSTRAINT "Resident_tenantUid_fkey";

-- AlterTable
ALTER TABLE "BathRecord" ALTER COLUMN "tenantUid" DROP NOT NULL,
ALTER COLUMN "caregiverUid" DROP NOT NULL,
ALTER COLUMN "residentUid" DROP NOT NULL;

-- AlterTable
ALTER TABLE "BeverageRecord" ALTER COLUMN "tenantUid" DROP NOT NULL,
ALTER COLUMN "caregiverUid" DROP NOT NULL,
ALTER COLUMN "residentUid" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DailyRecord" ALTER COLUMN "tenantUid" DROP NOT NULL,
ALTER COLUMN "caregiverUid" DROP NOT NULL,
ALTER COLUMN "residentUid" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EliminationRecord" ALTER COLUMN "tenantUid" DROP NOT NULL,
ALTER COLUMN "caregiverUid" DROP NOT NULL,
ALTER COLUMN "residentUid" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FoodRecord" ALTER COLUMN "tenantUid" DROP NOT NULL,
ALTER COLUMN "caregiverUid" DROP NOT NULL,
ALTER COLUMN "residentUid" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Resident" ALTER COLUMN "tenantUid" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodRecord" ADD CONSTRAINT "FoodRecord_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodRecord" ADD CONSTRAINT "FoodRecord_caregiverUid_fkey" FOREIGN KEY ("caregiverUid") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodRecord" ADD CONSTRAINT "FoodRecord_residentUid_fkey" FOREIGN KEY ("residentUid") REFERENCES "Resident"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BathRecord" ADD CONSTRAINT "BathRecord_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BathRecord" ADD CONSTRAINT "BathRecord_caregiverUid_fkey" FOREIGN KEY ("caregiverUid") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BathRecord" ADD CONSTRAINT "BathRecord_residentUid_fkey" FOREIGN KEY ("residentUid") REFERENCES "Resident"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeverageRecord" ADD CONSTRAINT "BeverageRecord_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeverageRecord" ADD CONSTRAINT "BeverageRecord_caregiverUid_fkey" FOREIGN KEY ("caregiverUid") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeverageRecord" ADD CONSTRAINT "BeverageRecord_residentUid_fkey" FOREIGN KEY ("residentUid") REFERENCES "Resident"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminationRecord" ADD CONSTRAINT "EliminationRecord_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminationRecord" ADD CONSTRAINT "EliminationRecord_caregiverUid_fkey" FOREIGN KEY ("caregiverUid") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EliminationRecord" ADD CONSTRAINT "EliminationRecord_residentUid_fkey" FOREIGN KEY ("residentUid") REFERENCES "Resident"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_caregiverUid_fkey" FOREIGN KEY ("caregiverUid") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_residentUid_fkey" FOREIGN KEY ("residentUid") REFERENCES "Resident"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
