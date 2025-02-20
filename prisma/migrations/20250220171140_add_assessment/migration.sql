-- CreateEnum
CREATE TYPE "CareLevel" AS ENUM ('NEEDS_CARE_1', 'NEEDS_CARE_2', 'NEEDS_CARE_3', 'NEEDS_CARE_4', 'NEEDS_CARE_5');

-- CreateEnum
CREATE TYPE "IndependenceLevel" AS ENUM ('INDEPENDENT', 'J1', 'J2', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "CognitiveIndependence" AS ENUM ('INDEPENDENT', 'I', 'IIa', 'IIb', 'IIIa', 'IIIb', 'IV', 'M');

-- CreateTable
CREATE TABLE "Subject" (
    "uid" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "familyNameFurigana" TEXT NOT NULL,
    "givenNameFurigana" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "tenantUid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "uid" TEXT NOT NULL,
    "subjectUid" TEXT NOT NULL,
    "tenantUid" TEXT,
    "userUid" TEXT,
    "familyInfo" TEXT,
    "careLevel" "CareLevel" NOT NULL,
    "physicalIndependence" "IndependenceLevel" NOT NULL,
    "cognitiveIndependence" "CognitiveIndependence" NOT NULL,
    "medicalHistory" TEXT,
    "medications" TEXT,
    "formalServices" TEXT,
    "informalSupport" TEXT,
    "consultationBackground" TEXT,
    "lifeHistory" TEXT,
    "complaints" TEXT,
    "healthNotes" TEXT,
    "mentalStatus" TEXT,
    "physicalStatus" TEXT,
    "adlStatus" TEXT,
    "communication" TEXT,
    "dailyLife" TEXT,
    "instrumentalADL" TEXT,
    "participation" TEXT,
    "environment" TEXT,
    "livingSituation" TEXT,
    "legalSupport" TEXT,
    "personalTraits" TEXT,
    "transcription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_subjectUid_key" ON "Assessment"("subjectUid");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_subjectUid_fkey" FOREIGN KEY ("subjectUid") REFERENCES "Subject"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_tenantUid_fkey" FOREIGN KEY ("tenantUid") REFERENCES "Tenant"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
