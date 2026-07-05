"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import { saveToken, getDashboardPath } from "@/lib/auth-client";

interface LoginResponse {
  token: string;
  user: { id: string; username: string; roles: string[] };
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      saveToken(data.token);
      if (data.user.roles.length === 1) {
        const activeRoleData = await apiFetch<{ token: string }>(
          "/api/auth/active-role",
          {
            method: "POST",
            auth: true,
            body: JSON.stringify({ role: data.user.roles[0] }),
          },
        );
        saveToken(activeRoleData.token);
        router.push(getDashboardPath(data.user.roles[0]));
      } else {
        router.push("/select-role");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-6 py-12">
      <div className="grid w-full gap-8 rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-2xl shadow-slate-900/5 backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
        <section className="relative overflow-hidden rounded-[1.5rem] bg-slate-950 px-6 py-8 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.25),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.22),_transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
                Welcome back
              </span>
              <h1 className="text-4xl font-black leading-tight">
                Login ke SEAPEDIA
              </h1>
              <p className="max-w-md text-sm leading-6 text-slate-300">
                Masuk untuk melihat katalog, mengelola toko, memproses pesanan,
                dan melanjutkan checkout dengan role aktif Anda.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">1</p>
                <p className="mt-1">Akun aman</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">4</p>
                <p className="mt-1">Role berbeda</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">24/7</p>
                <p className="mt-1">Akses cepat</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Masuk akun</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gunakan username dan password yang sudah terdaftar.
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
              required
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" isLoading={loading} className="w-full">
              Login
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-700 hover:text-blue-800">
              Register
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
