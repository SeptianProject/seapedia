import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const activeRole = req.headers.get("x-active-role");

    if (!userId || activeRole !== "Buyer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: userId,
          storeId: cart.storeId,
          totalAmount: new Prisma.Decimal(totalAmount),
          status: "PENDING",
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
        order: { ...order, totalAmount: order.totalAmount.toString() },
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
