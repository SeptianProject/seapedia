import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface AddToCartBody {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const activeRole = req.headers.get("x-active-role");

    if (!userId || activeRole !== "Buyer") {
      return NextResponse.json(
        {
          error:
            "Forbidden: hanya active role 'Buyer' yang bisa menambah ke cart",
        },
        { status: 403 },
      );
    }

    const body: AddToCartBody = await req.json();
    const { productId, quantity } = body;

    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: "productId wajib diisi, quantity harus integer >= 1" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Stock tidak cukup. Tersisa ${product.stock}` },
        { status: 400 },
      );
    }

    const activeCarts = await prisma.cart.findMany({
      where: { buyerId: userId, items: { some: {} } },
    });

    const conflictingCart = activeCarts.find(
      (c) => c.storeId !== product.storeId,
    );
    if (conflictingCart) {
      return NextResponse.json(
        {
          error:
            "Keranjang Anda berisi produk dari toko lain. Selesaikan checkout atau kosongkan keranjang terlebih dahulu sebelum belanja dari toko berbeda.",
        },
        { status: 400 },
      );
    }

    const cart = await prisma.cart.upsert({
      where: { buyerId_storeId: { buyerId: userId, storeId: product.storeId } },
      update: {},
      create: { buyerId: userId, storeId: product.storeId },
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    const newQuantity = (existingItem?.quantity ?? 0) + quantity;
    if (newQuantity > product.stock) {
      return NextResponse.json(
        {
          error: `Total quantity melebihi stock. Tersisa ${product.stock}, di cart sudah ${existingItem?.quantity ?? 0}`,
        },
        { status: 400 },
      );
    }

    const cartItem = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: newQuantity },
      create: { cartId: cart.id, productId, quantity },
    });

    return NextResponse.json(
      { message: "Produk berhasil ditambahkan ke keranjang", cartItem },
      { status: 201 },
    );
  } catch (error) {
    console.error("[ADD_TO_CART_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
