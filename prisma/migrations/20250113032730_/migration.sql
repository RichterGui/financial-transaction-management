-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_targetWalletId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "targetWalletId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_targetWalletId_fkey" FOREIGN KEY ("targetWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
