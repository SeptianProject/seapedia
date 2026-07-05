"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import CheckoutModal from "@/components/buyer/CheckoutModal";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string;
    imageUrl: string | null;
    stock: number;
  };
}

interface CartData {
  id: string;
  store: { id: string; name: string };
  items: CartItem[];
}

export default function CartPage() {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);
    try {
      const data = await apiFetch<{ cart: CartData | null }>(
        "/api/buyer/cart",
        { auth: true },
      );
      setCart(data.cart);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat keranjang",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  const subtotal =
    cart?.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    ) ?? 0;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center text-gray-400">
        Memuat keranjang...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-500">Keranjang Anda kosong.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">Keranjang Belanja</h1>
      <p className="text-sm text-gray-500 mb-6">Toko: {cart.store.name}</p>

      <div className="flex flex-col gap-3">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border rounded-lg p-3 bg-white">
            <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              {item.product.imageUrl && (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-gray-500">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(Number(item.product.price))}{" "}
                × {item.quantity}
              </p>
            </div>
            <p className="font-semibold">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(Number(item.product.price) * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Subtotal</p>
          <p className="text-xl font-bold">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(subtotal)}
          </p>
        </div>
        <button
          onClick={() => setShowCheckout(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
          Checkout
        </button>
      </div>

      {showCheckout && (
        <CheckoutModal
          subtotal={subtotal}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            loadCart();
          }}
        />
      )}
    </div>
  );
}
