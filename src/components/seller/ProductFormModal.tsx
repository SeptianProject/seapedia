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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Edit Produk" : "Tambah Produk"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Nama Produk"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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

          <div className="flex gap-3 mt-2">
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
