import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface UpdateOrderStatusBody {
  status: "PROCESSING" | "READY_FOR_DELIVERY";
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PROCESSING"],
  PROCESSING: ["READY_FOR_DELIVERY"],
};

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const activeRole = req.headers.get("x-active-role");

    if (!userId || activeRole !== "Seller") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const store = await prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      return NextResponse.json(
        { error: "Anda belum memiliki toko" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 },
      );
    }

    if (order.storeId !== store.id) {
      return NextResponse.json(
        { error: "Forbidden: order ini bukan milik toko Anda" },
        { status: 403 },
      );
    }

    const body: UpdateOrderStatusBody = await req.json();
    const { status } = body;

    const allowedNext = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowedNext.includes(status)) {
      return NextResponse.json(
        { error: `Transisi status tidak valid: ${order.status} -> ${status}` },
        { status: 400 },
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      message: `Status order berhasil diubah menjadi ${status}`,
      order: { ...updated, totalAmount: updated.totalAmount.toString() },
    });
  } catch (error) {
    console.error("[UPDATE_ORDER_STATUS_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
