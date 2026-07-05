import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const activeRole = req.headers.get("x-active-role");

    if (activeRole !== "Driver") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { status: "READY_FOR_DELIVERY", driverId: null },
      include: {
        store: { select: { id: true, name: true, address: true } },
        buyer: { select: { id: true, username: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      data: orders.map((o) => ({
        ...o,
        totalAmount: o.totalAmount.toString(),
      })),
    });
  } catch (error) {
    console.error("[GET_DRIVER_ORDERS_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
