// app/seller/orders/page.tsx
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
  READY_FOR_DELIVERY: null, // sudah final di tangan seller, tunggu driver
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
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Pesanan Masuk</h1>

      {loading ? (
        <p className="text-gray-400">Memuat...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Belum ada pesanan.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const nextStatus = NEXT_STATUS[order.status];
            return (
              <div
                key={order.id}
                className="border rounded-xl p-4 bg-white flex items-center justify-between">
                <div>
                  <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    {order.buyer.username} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(Number(order.totalAmount))}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                    {STATUS_LABEL[order.status]}
                  </span>
                  {nextStatus && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, nextStatus)}
                      disabled={updatingId === order.id}
                      className="text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg">
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
