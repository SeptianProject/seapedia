/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import ProductFormModal from "@/components/seller/ProductFormModal";

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  description: string | null;
}

export default function SellerProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await apiFetch<{ data: Product[] }>("/api/seller/products", {
        auth: true,
      });
      setProducts(data.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat produk",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await apiFetch(`/api/seller/products/${id}`, {
        method: "DELETE",
        auth: true,
      });
      showToast("Produk berhasil dihapus");
      loadProducts();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal menghapus produk",
        "error",
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 rounded-3xl border border-white/70 bg-slate-950 px-6 py-6 text-white shadow-2xl shadow-slate-900/10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
          Seller dashboard
        </p>
        <h1 className="mt-2 text-3xl font-black">Produk Saya</h1>
        <p className="mt-2 text-sm text-slate-300">
          Tambah, ubah, dan hapus produk dari etalase toko Anda.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Daftar Produk</h2>
          <p className="text-sm text-slate-500">
            Atur stok dan harga secara langsung.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}>
          + Tambah Produk
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-500">Memuat...</p>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-white/70 bg-white/85 p-8 text-center shadow-sm backdrop-blur-sm">
          <p className="text-slate-500">
            Belum ada produk. Tambahkan produk pertama Anda.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-sm backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(Number(p.price))}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{p.stock}</td>
                  <td className="px-4 py-3 space-x-2 text-right">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setModalOpen(true);
                      }}
                      className="font-medium text-blue-700 hover:text-blue-800">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="font-medium text-red-600 hover:text-red-700">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
