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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Checkout</h2>

        <div className="flex flex-col gap-1 mb-4">
          <label className="text-sm font-medium text-gray-700">
            Metode Pengiriman
          </label>
          <select
            value={deliveryMethod}
            onChange={(e) =>
              setDeliveryMethod(e.target.value as typeof deliveryMethod)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg">
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
          className="mb-4"
        />

        <div className="border-t pt-3 flex flex-col gap-1 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Biaya Kirim</span>
            <span>{formatIDR(deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">PPN 12%</span>
            <span>{formatIDR(taxAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t mt-1">
            <span>Estimasi Total</span>
            <span>{formatIDR(estimatedTotal)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            *Diskon dihitung final oleh server jika kode valid
          </p>
        </div>

        <div className="flex gap-3">
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
