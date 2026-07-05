import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const activeRole = req.headers.get("x-active-role");
    if (activeRole !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();

    const overdueOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PENDING", "PROCESSING", "READY_FOR_DELIVERY", "ON_DELIVERY"],
        },
        dueAt: { lt: now },
      },
      include: { items: true },
    });

    if (overdueOrders.length === 0) {
      return NextResponse.json({
        message: "Tidak ada order overdue",
        processedCount: 0,
      });
    }

    const results = await prisma.$transaction(async (tx) => {
      const processed: {
        orderId: string;
        newStatus: string;
        refundAmount: string;
      }[] = [];

      for (const order of overdueOrders) {
        const newStatus = ["PENDING", "PROCESSING"].includes(order.status)
          ? "CANCELLED"
          : "RETURNED";

        await tx.order.update({
          where: { id: order.id },
          data: { status: newStatus },
        });

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        await tx.wallet.upsert({
          where: { userId: order.buyerId },
          update: { balance: { increment: order.totalAmount } },
          create: { userId: order.buyerId, balance: order.totalAmount },
        });

        processed.push({
          orderId: order.id,
          newStatus,
          refundAmount: order.totalAmount.toString(),
        });
      }

      return processed;
    });

    return NextResponse.json({
      message: `${results.length} order overdue berhasil diproses`,
      processedCount: results.length,
      details: results,
    });
  } catch (error) {
    console.error("[SIMULATE_DAY_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
