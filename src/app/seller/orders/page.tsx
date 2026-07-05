"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface Order {
  id: string;
  status: string;
  totalAmount: string;
  buyer: { username: string };
  createdAt: string;
}

const NEXT_STATUS: Record<string, string | null> = {
  PENDING: "PROCESSING",
  PROCESSING: "READY_FOR_DELIVERY",
  READY_FOR_DELIVERY: null,
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Diproses",
  PROCESSING: "Sedang Diproses",
  READY_FOR_DELIVERY: "Siap Dikirim",
  ON_DELIVERY: "Dalam Pengiriman",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
  RETURNED: "Diretur",
};

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function SellerOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await apiFetch<{ data: Order[] }>("/api/seller/orders", {
        auth: true,
      });
      setOrders(data.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat pesanan",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAdvanceStatus(orderId: string, nextStatus: string) {
    setUpdatingId(orderId);
    try {
      await apiFetch(`/api/seller/orders/${orderId}`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ status: nextStatus }),
      });
      showToast(`Status diubah menjadi ${STATUS_LABEL[nextStatus]}`);
      loadOrders();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal mengubah status",
        "error",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 rounded-3xl border border-white/70 bg-slate-950 px-6 py-6 text-white shadow-2xl shadow-slate-900/10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
          Seller dashboard
        </p>
        <h1 className="mt-2 text-3xl font-black">Pesanan Masuk</h1>
        <p className="mt-2 text-sm text-slate-300">
          Kelola pesanan yang masuk dan lanjutkan status sesuai alur
          fulfillment.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500">Memuat...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-white/70 bg-white/85 p-8 text-center shadow-sm backdrop-blur-sm">
          <p className="text-slate-500">Belum ada pesanan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const nextStatus = NEXT_STATUS[order.status];
            return (
              <div
                key={order.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {order.buyer.username} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatIDR(Number(order.totalAmount))}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {STATUS_LABEL[order.status]}
                  </span>
                  {nextStatus && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, nextStatus)}
                      disabled={updatingId === order.id}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
                      {updatingId === order.id
                        ? "..."
                        : `→ ${STATUS_LABEL[nextStatus]}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
