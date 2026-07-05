"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";

interface RegisterResponse {
  message: string;
  user: {
    id: string;
    username: string;
    roles: string[];
  };
}

const ROLE_OPTIONS = ["Buyer", "Seller", "Driver", "Admin"] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>(["Buyer"]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () =>
      username.trim().length > 0 && password.length >= 6 && roles.length > 0,
    [username, password, roles],
  );

  function toggleRole(role: string) {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await apiFetch<RegisterResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          roles,
        }),
      });

      setSuccess(`${data.message}. Silakan login dengan akun baru Anda.`);
      setTimeout(() => router.push("/login"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-6 py-12">
      <div className="grid w-full gap-8 rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-2xl shadow-slate-900/5 backdrop-blur-sm lg:grid-cols-[0.95fr_1.05fr] lg:p-6">
        <section className="rounded-[1.5rem] bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">
            Buat akun SEAPEDIA
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Daftarkan username, password, dan role yang ingin dipakai. Satu akun
            bisa memiliki lebih dari satu role.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              id="username"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((role) => {
                  const selected = roles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all ${selected ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40"}`}>
                      <span className="block">{role}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {selected ? "Dipilih" : "Klik untuk pilih"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <Button
              type="submit"
              isLoading={loading}
              disabled={!canSubmit}
              className="w-full">
              Register
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-700 hover:text-blue-800">
              Login
            </Link>
          </p>
        </section>

        <section className="relative overflow-hidden rounded-[1.5rem] bg-slate-950 px-6 py-8 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.24),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.2),_transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
                New account
              </span>
              <h2 className="text-4xl font-black leading-tight">
                Akun siap dipakai untuk semua role.
              </h2>
              <p className="max-w-md text-sm leading-6 text-slate-300">
                Buyer untuk belanja, Seller untuk kelola toko, Driver untuk
                pengantaran, dan Admin untuk kontrol sistem.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Multi-role ready</p>
                <p className="mt-1">Pilih beberapa role saat register.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Fast handoff</p>
                <p className="mt-1">Setelah register, langsung login lagi.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
