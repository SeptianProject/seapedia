/*
  Warnings:

  - Added the required column `deliveryFee` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryMethod` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueAt` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAmount` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('VOUCHER', 'PROMO');

-- CreateEnum
CREATE TYPE "DiscountValueType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('INSTANT', 'NEXT_DAY', 'REGULAR');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'RETURNED';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deliveryFee" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "deliveryMethod" "DeliveryMethod" NOT NULL,
ADD COLUMN     "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "discountId" TEXT,
ADD COLUMN     "dueAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "taxAmount" DECIMAL(12,2) NOT NULL;

-- CreateTable
CREATE TABLE "discounts" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "type" "DiscountType" NOT NULL,
    "valueType" "DiscountValueType" NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "maxDiscount" DECIMAL(12,2),
    "minPurchase" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discounts_code_key" ON "discounts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE INDEX "orders_dueAt_idx" ON "orders"("dueAt");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
