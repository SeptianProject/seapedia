"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  description: string | null;
}

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductFormModal({
  product,
  onClose,
  onSuccess,
}: ProductFormModalProps) {
  const { showToast } = useToast();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
    };

    try {
      if (isEdit) {
        await apiFetch(`/api/seller/products/${product.id}`, {
          method: "PUT",
          auth: true,
          body: JSON.stringify(payload),
        });
        showToast("Produk berhasil diupdate");
      } else {
        await apiFetch("/api/seller/products", {
          method: "POST",
          auth: true,
          body: JSON.stringify(payload),
        });
        showToast("Produk berhasil ditambahkan");
      }
      onSuccess();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal menyimpan produk",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Seller tools
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {isEdit ? "Edit Produk" : "Tambah Produk"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-50">
            Tutup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            id="name"
            label="Nama Produk"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-sm font-medium text-slate-700">
              Deskripsi
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="price"
              label="Harga (Rp)"
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              id="stock"
              label="Stok"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>

          <div className="mt-2 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1">
              Batal
            </Button>
            <Button type="submit" isLoading={submitting} className="flex-1">
              {isEdit ? "Simpan Perubahan" : "Tambah Produk"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
