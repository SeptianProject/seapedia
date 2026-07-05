"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
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

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
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
        {
          auth: true,
        },
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
      <div className="mx-auto max-w-5xl px-6 py-12 text-center text-slate-500">
        Memuat keranjang...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-10 text-center shadow-sm backdrop-blur-sm">
          <p className="text-slate-600">Keranjang Anda kosong.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 rounded-3xl border border-white/70 bg-slate-950 px-6 py-6 text-white shadow-2xl shadow-slate-900/10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
          Buyer checkout
        </p>
        <h1 className="mt-2 text-3xl font-black">Keranjang Belanja</h1>
        <p className="mt-2 text-sm text-slate-300">Toko: {cart.store.name}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-3">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                {item.product.imageUrl && (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">
                  {item.product.name}
                </p>
                <p className="text-sm text-slate-500">
                  {formatIDR(Number(item.product.price))} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-slate-900">
                {formatIDR(Number(item.product.price) * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Ringkasan
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatIDR(subtotal)}
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-slate-500">
              Checkout akan menghitung biaya kirim, pajak, dan diskon final di
              server.
            </div>
          </div>

          <Button onClick={() => setShowCheckout(true)} className="mt-5 w-full">
            Checkout
          </Button>
        </aside>
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
