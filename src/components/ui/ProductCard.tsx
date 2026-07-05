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
      // Pesan spesifik dari backend, termasuk error single-store checkout
      showToast(
        err instanceof Error ? err.message : "Gagal menambah ke keranjang",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white flex flex-col">
      <div className="relative w-full aspect-square bg-gray-100">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{name}</h3>
        <p className="text-blue-600 font-bold">{formattedPrice}</p>
        <p className="text-xs text-gray-500 mb-2">{store.name}</p>
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
