import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const activeRole = req.headers.get("x-active-role");

    if (!userId || activeRole !== "Buyer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cart = await prisma.cart.findFirst({
      where: { buyerId: userId, items: { some: {} } },
      include: {
        store: { select: { id: true, name: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ cart: null });
    }

    return NextResponse.json({
      cart: {
        id: cart.id,
        store: cart.store,
        items: cart.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          product: { ...item.product, price: item.product.price.toString() },
        })),
      },
    });
  } catch (error) {
    console.error("[GET_CART_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
