import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const activeRole = req.headers.get("x-active-role");

    if (!userId || activeRole !== "Seller") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const store = await prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      return NextResponse.json({ data: [] });
    }

    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: { buyer: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: orders.map((o) => ({
        ...o,
        totalAmount: o.totalAmount.toString(),
      })),
    });
  } catch (error) {
    console.error("[GET_SELLER_ORDERS_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
