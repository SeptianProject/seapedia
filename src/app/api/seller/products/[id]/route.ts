import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "../../../../../../generated/prisma/client";

interface UpdateProductBody {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function assertProductOwnership(productId: string, userId: string) {
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) {
    return { error: "Anda belum memiliki toko", status: 400 as const };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return { error: "Produk tidak ditemukan", status: 404 as const };
  }

  if (product.storeId !== store.id) {
    return {
      error: "Forbidden: produk ini bukan milik toko Anda",
      status: 403 as const,
    };
  }

  return { product, store };
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const activeRole = req.headers.get("x-active-role");

    if (!userId || activeRole !== "Seller") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const check = await assertProductOwnership(id, userId);
    if ("error" in check) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status },
      );
    }

    const body: UpdateProductBody = await req.json();
    const { name, description, price, stock } = body;

    if (price !== undefined && price <= 0) {
      return NextResponse.json(
        { error: "Price harus positif" },
        { status: 400 },
      );
    }
    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
      return NextResponse.json(
        { error: "Stock harus integer >= 0" },
        { status: 400 },
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(price !== undefined && { price: new Prisma.Decimal(price) }),
        ...(stock !== undefined && { stock }),
      },
    });

    return NextResponse.json({
      message: "Produk berhasil diupdate",
      product: { ...updated, price: updated.price.toString() },
    });
  } catch (error) {
    console.error("[UPDATE_PRODUCT_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const activeRole = req.headers.get("x-active-role");

    if (!userId || activeRole !== "Seller") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const check = await assertProductOwnership(id, userId);
    if ("error" in check) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status },
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE_PRODUCT_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
