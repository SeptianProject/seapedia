import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface CreateStoreBody {
  name: string;
  description?: string;
  logoUrl?: string;
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const activeRole = req.headers.get("x-active-role");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: user tidak teridentifikasi" },
        { status: 401 },
      );
    }

    if (activeRole !== "Seller") {
      return NextResponse.json(
        {
          error: "Forbidden: hanya active role 'Seller' yang bisa membuat toko",
        },
        { status: 403 },
      );
    }

    const body: CreateStoreBody = await req.json();
    const { name, description, logoUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Nama toko wajib diisi" },
        { status: 400 },
      );
    }

    const existingStore = await prisma.store.findUnique({
      where: { ownerId: userId },
    });
    if (existingStore) {
      return NextResponse.json(
        {
          error:
            "User ini sudah memiliki toko. Satu Seller hanya bisa punya satu toko.",
        },
        { status: 409 },
      );
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        logoUrl,
        ownerId: userId,
      },
    });

    return NextResponse.json(
      { message: "Toko berhasil dibuat", store },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CREATE_STORE_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
