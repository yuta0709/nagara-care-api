-- CreateTable
CREATE TABLE "QaSession" (
    "uid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userUid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transcription" TEXT,

    CONSTRAINT "QaSession_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "QuestionAnswer" (
    "uid" TEXT NOT NULL,
    "qaSessionUid" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionAnswer_pkey" PRIMARY KEY ("uid")
);

-- AddForeignKey
ALTER TABLE "QaSession" ADD CONSTRAINT "QaSession_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_qaSessionUid_fkey" FOREIGN KEY ("qaSessionUid") REFERENCES "QaSession"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
