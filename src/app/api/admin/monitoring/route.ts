import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { $Enums } from "../../../../../generated/prisma/client";

const HELD_STATUSES: $Enums.OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "READY_FOR_DELIVERY",
  "ON_DELIVERY",
] as const;

export async function GET(req: NextRequest) {
  try {
    const activeRole = req.headers.get("x-active-role");
    if (activeRole !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [totalSuccessOrders, totalStores, heldOrders] =
      await prisma.$transaction([
        prisma.order.count({ where: { status: "DELIVERED" } }),
        prisma.store.count(),
        prisma.order.findMany({
          where: { status: { in: HELD_STATUSES } },
          include: {
            buyer: { select: { username: true } },
            store: { select: { name: true } },
          },
          orderBy: { dueAt: "asc" },
        }),
      ]);

    return NextResponse.json({
      analytics: {
        totalSuccessOrders,
        totalStores,
        totalHeldOrders: heldOrders.length,
      },
      heldOrders: heldOrders.map((o) => ({
        ...o,
        subtotal: o.subtotal.toString(),
        discountAmount: o.discountAmount.toString(),
        deliveryFee: o.deliveryFee.toString(),
        taxAmount: o.taxAmount.toString(),
        totalAmount: o.totalAmount.toString(),
      })),
    });
  } catch (error) {
    console.error("[ADMIN_MONITORING_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
