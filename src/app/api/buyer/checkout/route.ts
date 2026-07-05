import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma/client";
import {
  DELIVERY_FEE,
  DELIVERY_TOLERANCE_MS,
  TAX_RATE,
  calculateDiscountAmount,
} from "@/lib/pricing";

interface CheckoutBody {
  deliveryMethod: "INSTANT" | "NEXT_DAY" | "REGULAR";
  discountCode?: string;
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const activeRole = req.headers.get("x-active-role");

    if (!userId || activeRole !== "Buyer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: CheckoutBody = await req.json();
    const { deliveryMethod, discountCode } = body;

    if (!deliveryMethod || !DELIVERY_FEE[deliveryMethod]) {
      return NextResponse.json(
        {
          error:
            "deliveryMethod harus salah satu dari: INSTANT, NEXT_DAY, REGULAR",
        },
        { status: 400 },
      );
    }

    const cart = await prisma.cart.findFirst({
      where: { buyerId: userId, items: { some: {} } },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock '${item.product.name}' tidak cukup. Tersisa ${item.product.stock}`,
          },
          { status: 400 },
        );
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    let appliedDiscount = null;
    if (discountCode) {
      appliedDiscount = await prisma.discount.findUnique({
        where: { code: discountCode },
      });
      if (!appliedDiscount || !appliedDiscount.isActive) {
        return NextResponse.json(
          { error: "Kode voucher tidak valid atau sudah tidak aktif" },
          { status: 400 },
        );
      }
      if (appliedDiscount.expiresAt && appliedDiscount.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Kode voucher sudah kedaluwarsa" },
          { status: 400 },
        );
      }
      if (subtotal < Number(appliedDiscount.minPurchase)) {
        return NextResponse.json(
          {
            error: `Minimal belanja Rp${appliedDiscount.minPurchase} untuk pakai voucher ini`,
          },
          { status: 400 },
        );
      }
    } else {
      appliedDiscount = await prisma.discount.findFirst({
        where: {
          type: "PROMO",
          isActive: true,
          minPurchase: { lte: subtotal },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { value: "desc" },
      });
    }

    const discountAmount = appliedDiscount
      ? calculateDiscountAmount(subtotal, appliedDiscount)
      : 0;
    const deliveryFee = DELIVERY_FEE[deliveryMethod];
    const taxAmount = (subtotal - discountAmount) * TAX_RATE;
    const totalAmount = subtotal - discountAmount + deliveryFee + taxAmount;
    const dueAt = new Date(Date.now() + DELIVERY_TOLERANCE_MS[deliveryMethod]);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: userId,
          storeId: cart.storeId,
          status: "PENDING",
          subtotal: new Prisma.Decimal(subtotal),
          discountId: appliedDiscount?.id,
          discountAmount: new Prisma.Decimal(discountAmount),
          deliveryMethod,
          deliveryFee: new Prisma.Decimal(deliveryFee),
          taxAmount: new Prisma.Decimal(taxAmount),
          totalAmount: new Prisma.Decimal(totalAmount),
          dueAt,
        },
      });

      await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          priceSnapshot: item.product.price,
        })),
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.delete({ where: { id: cart.id } });

      return newOrder;
    });

    return NextResponse.json(
      {
        message: "Checkout berhasil",
        order: {
          ...order,
          subtotal: order.subtotal.toString(),
          discountAmount: order.discountAmount.toString(),
          deliveryFee: order.deliveryFee.toString(),
          taxAmount: order.taxAmount.toString(),
          totalAmount: order.totalAmount.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
