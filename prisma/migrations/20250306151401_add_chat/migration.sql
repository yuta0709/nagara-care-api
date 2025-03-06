-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "Thread" (
    "uid" TEXT NOT NULL,
    "createdByUid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Message" (
    "uid" TEXT NOT NULL,
    "threadUid" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("uid")
);

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_createdByUid_fkey" FOREIGN KEY ("createdByUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadUid_fkey" FOREIGN KEY ("threadUid") REFERENCES "Thread"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
