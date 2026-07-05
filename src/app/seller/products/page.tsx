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
      // Filter produk milik toko sendiri lewat query search kosong + client-side filter
      // Cara lebih tepat: buat GET /api/seller/products khusus, tapi ini bisa reuse /api/products
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
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produk Saya</h1>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}>
          + Tambah Produk
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-400">Memuat...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">
          Belum ada produk. Tambahkan produk pertama Anda.
        </p>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
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
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(Number(p.price))}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setModalOpen(true);
                      }}
                      className="text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:underline">
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
