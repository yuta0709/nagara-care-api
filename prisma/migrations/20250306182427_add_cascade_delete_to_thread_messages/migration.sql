-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_threadUid_fkey";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadUid_fkey" FOREIGN KEY ("threadUid") REFERENCES "Thread"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
