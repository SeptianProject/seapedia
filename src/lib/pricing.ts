import { Prisma } from "../../generated/prisma/client";

export const DELIVERY_FEE: Record<string, number> = {
  INSTANT: 15000,
  NEXT_DAY: 10000,
  REGULAR: 5000,
};

export const DELIVERY_TOLERANCE_MS: Record<string, number> = {
  INSTANT: 1 * 60 * 60 * 1000, // 1 jam
  NEXT_DAY: 24 * 60 * 60 * 1000, // 24 jam
  REGULAR: 72 * 60 * 60 * 1000, // 72 jam
};

export const TAX_RATE = 0.12;

export function calculateDiscountAmount(
  subtotal: number,
  discount: {
    valueType: string;
    value: Prisma.Decimal;
    maxDiscount: Prisma.Decimal | null;
  },
): number {
  const value = Number(discount.value);
  let amount =
    discount.valueType === "PERCENTAGE" ? (subtotal * value) / 100 : value;

  if (discount.maxDiscount) {
    amount = Math.min(amount, Number(discount.maxDiscount));
  }
  return Math.min(amount, subtotal);
}
