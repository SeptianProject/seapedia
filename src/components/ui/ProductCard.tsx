"use client";

import Image from "next/image";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth-client";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  imageUrl?: string | null;
  store: { name: string };
}

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  store,
}: ProductCardProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(price));

  async function handleAddToCart() {
    const user = getCurrentUser();
    if (!user) {
      showToast("Silakan login terlebih dahulu", "error");
      return;
    }
    if (user.activeRole !== "Buyer") {
      showToast("Hanya Buyer yang bisa menambah ke keranjang", "error");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/buyer/cart", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ productId: id, quantity: 1 }),
      });
      showToast("Produk ditambahkan ke keranjang");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal menambah ke keranjang",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square w-full bg-linear-to-br from-slate-100 to-slate-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No Image
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-slate-900/35 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
          {name}
        </h3>
        <p className="text-lg font-bold text-blue-700">{formattedPrice}</p>
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
          {store.name}
        </p>
        <Button
          variant="primary"
          isLoading={loading}
          onClick={handleAddToCart}
          className="mt-auto w-full text-sm">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
