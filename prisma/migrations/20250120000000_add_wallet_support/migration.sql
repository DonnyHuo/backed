-- AlterTable
ALTER TABLE "users" 
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" 
  ADD COLUMN "walletAddress" TEXT,
  ADD COLUMN "walletNonce" TEXT,
  ADD COLUMN "walletNonceExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

