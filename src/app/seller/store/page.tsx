"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Store {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export default function SellerStorePage() {
  const { showToast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkStore();
  }, []);

  async function checkStore() {
    try {
      const data = await apiFetch<{ store: Store | null }>(
        "/api/seller/store",
        { auth: true },
      );
      setStore(data.store);
    } catch {
      setStore(null);
    } finally {
      setChecking(false);
    }
  }

  async function handleCreateStore(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await apiFetch<{ store: Store }>("/api/seller/store", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ name, description }),
      });
      setStore(data.store);
      showToast("Toko berhasil dibuat!");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal membuat toko",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="max-w-lg mx-auto px-6 py-12 text-center text-gray-400">
        Memuat...
      </div>
    );
  }

  if (store) {
    return (
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="border rounded-xl p-6 bg-white">
          <h1 className="text-2xl font-bold mb-2">{store.name}</h1>
          <p className="text-gray-500">
            {store.description ?? "Belum ada deskripsi"}
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Dibuat pada {new Date(store.createdAt).toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Buka Toko Baru</h1>
      <form
        onSubmit={handleCreateStore}
        className="flex flex-col gap-4 border rounded-xl p-6 bg-white">
        <Input
          id="name"
          label="Nama Toko"
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
        <Button type="submit" isLoading={submitting}>
          Buat Toko
        </Button>
      </form>
    </div>
  );
}
