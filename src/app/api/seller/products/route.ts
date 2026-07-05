import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma/client";

interface CreateProductBody {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const activeRole = req.headers.get("x-active-role");

    if (!userId || activeRole !== "Seller") {
      return NextResponse.json(
        {
          error:
            "Forbidden: hanya active role 'Seller' yang bisa menambah produk",
        },
        { status: 403 },
      );
    }

    const store = await prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      return NextResponse.json(
        {
          error:
            "Anda belum memiliki toko. Buat toko terlebih dahulu di /api/seller/store",
        },
        { status: 400 },
      );
    }

    const body: CreateProductBody = await req.json();
    const { name, description, price, stock } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Nama produk wajib diisi" },
        { status: 400 },
      );
    }
    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "Price harus angka positif" },
        { status: 400 },
      );
    }
    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { error: "Stock harus integer >= 0" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        price: new Prisma.Decimal(price),
        stock,
        storeId: store.id,
      },
    });

    return NextResponse.json(
      {
        message: "Produk berhasil ditambahkan",
        product: { ...product, price: product.price.toString() },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CREATE_PRODUCT_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

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

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: products.map((p) => ({ ...p, price: p.price.toString() })),
    });
  } catch (error) {
    console.error("[GET_SELLER_PRODUCTS_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
