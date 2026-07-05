import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface UpdateDeliveryBody {
  action: "TAKE" | "COMPLETE";
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const activeRole = req.headers.get("x-active-role");

    if (!userId || activeRole !== "Driver") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: UpdateDeliveryBody = await req.json();
    const { action } = body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 },
      );
    }

    if (action === "TAKE") {
      if (order.status !== "READY_FOR_DELIVERY") {
        return NextResponse.json(
          { error: `Order dengan status '${order.status}' belum bisa diambil` },
          { status: 400 },
        );
      }
      if (order.driverId !== null) {
        return NextResponse.json(
          { error: "Order sudah diambil driver lain" },
          { status: 409 },
        );
      }

      const result = await prisma.order.updateMany({
        where: { id, driverId: null, status: "READY_FOR_DELIVERY" },
        data: { driverId: userId, status: "ON_DELIVERY" },
      });

      if (result.count === 0) {
        return NextResponse.json(
          { error: "Order sudah diambil driver lain (race condition)" },
          { status: 409 },
        );
      }

      const updated = await prisma.order.findUnique({ where: { id } });
      return NextResponse.json({
        message: "Order berhasil diambil",
        order: { ...updated, totalAmount: updated!.totalAmount.toString() },
      });
    }

    if (action === "COMPLETE") {
      if (order.driverId !== userId) {
        return NextResponse.json(
          { error: "Forbidden: order ini bukan tanggung jawab Anda" },
          { status: 403 },
        );
      }
      if (order.status !== "ON_DELIVERY") {
        return NextResponse.json(
          {
            error: `Order dengan status '${order.status}' tidak bisa diselesaikan`,
          },
          { status: 400 },
        );
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { status: "DELIVERED" },
      });

      return NextResponse.json({
        message: "Order berhasil diselesaikan",
        order: { ...updated, totalAmount: updated.totalAmount.toString() },
      });
    }

    return NextResponse.json(
      { error: "Action tidak valid. Gunakan 'TAKE' atau 'COMPLETE'" },
      { status: 400 },
    );
  } catch (error) {
    console.error("[UPDATE_DELIVERY_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
