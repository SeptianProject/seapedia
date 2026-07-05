// components/buyer/CheckoutModal.tsx
"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface CheckoutModalProps {
  subtotal: number;
  onClose: () => void;
  onSuccess: () => void;
}

const DELIVERY_FEE: Record<string, number> = {
  INSTANT: 15000,
  NEXT_DAY: 10000,
  REGULAR: 5000,
};
const TAX_RATE = 0.12;

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function CheckoutModal({
  subtotal,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const { showToast } = useToast();
  const [deliveryMethod, setDeliveryMethod] = useState<
    "INSTANT" | "NEXT_DAY" | "REGULAR"
  >("REGULAR");
  const [discountCode, setDiscountCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Preview only — nilai final dihitung ulang di backend
  const deliveryFee = DELIVERY_FEE[deliveryMethod];
  const taxAmount = subtotal * TAX_RATE;
  const estimatedTotal = subtotal + deliveryFee + taxAmount;

  async function handlePay() {
    setLoading(true);
    try {
      await apiFetch("/api/buyer/checkout", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          deliveryMethod,
          ...(discountCode.trim() && { discountCode: discountCode.trim() }),
        }),
      });
      showToast("Checkout berhasil! Pesanan sedang diproses.");
      onSuccess();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Checkout gagal", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Checkout
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Konfirmasi Pesanan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-50">
            Tutup
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Metode Pengiriman
            </label>
            <select
              value={deliveryMethod}
              onChange={(e) =>
                setDeliveryMethod(e.target.value as typeof deliveryMethod)
              }
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15">
              <option value="REGULAR">
                Regular — {formatIDR(DELIVERY_FEE.REGULAR)}
              </option>
              <option value="NEXT_DAY">
                Next Day — {formatIDR(DELIVERY_FEE.NEXT_DAY)}
              </option>
              <option value="INSTANT">
                Instant — {formatIDR(DELIVERY_FEE.INSTANT)}
              </option>
            </select>
          </div>

          <Input
            id="discount_code"
            label="Kode Diskon (opsional)"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Contoh: DISKON10"
          />

          <div className="rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatIDR(subtotal)}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-slate-600">
              <span>Biaya Kirim</span>
              <span className="font-semibold text-slate-900">
                {formatIDR(deliveryFee)}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-slate-600">
              <span>PPN 12%</span>
              <span className="font-semibold text-slate-900">
                {formatIDR(taxAmount)}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
              <span>Estimasi Total</span>
              <span>{formatIDR(estimatedTotal)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Diskon dihitung final oleh server jika kode valid.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button onClick={handlePay} isLoading={loading} className="flex-1">
            Bayar Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
