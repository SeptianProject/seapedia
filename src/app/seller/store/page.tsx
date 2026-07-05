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
      <div className="mx-auto max-w-lg px-6 py-12 text-center text-slate-500">
        Memuat...
      </div>
    );
  }

  if (store) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Seller dashboard
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            {store.name}
          </h1>
          <p className="mt-2 text-slate-500">
            {store.description ?? "Belum ada deskripsi"}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Dibuat pada {new Date(store.createdAt).toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 rounded-3xl border border-white/70 bg-slate-950 px-6 py-6 text-white shadow-2xl shadow-slate-900/10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
          Seller onboarding
        </p>
        <h1 className="mt-2 text-3xl font-black">Buka Toko Baru</h1>
        <p className="mt-2 text-sm text-slate-300">
          Siapkan identitas toko sebelum Anda mulai mengatur produk.
        </p>
      </div>

      <form
        onSubmit={handleCreateStore}
        className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm">
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
        <Button type="submit" isLoading={submitting}>
          Buat Toko
        </Button>
      </form>
    </div>
  );
}
