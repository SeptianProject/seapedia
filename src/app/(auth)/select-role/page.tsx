"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, saveToken, getDashboardPath } from "@/lib/auth-client";

export default function SelectRolePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setRoles(user.roles);
  }, [router]);

  async function handleSelectRole(role: string) {
    setError("");
    setLoading(role);

    try {
      const data = await apiFetch<{ token: string }>("/api/auth/active-role", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ role }),
      });

      saveToken(data.token);
      router.push(getDashboardPath(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memilih role");
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center px-6 py-12">
      <div className="grid w-full gap-8 rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-2xl shadow-slate-900/5 backdrop-blur-sm lg:grid-cols-[0.9fr_1.1fr] lg:p-6">
        <section className="rounded-[1.5rem] bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">
            Pilih Role Aktif
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Akun Anda memiliki beberapa role. Pilih salah satu untuk melanjutkan
            ke area yang sesuai.
          </p>

          {roles.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Role belum ditemukan pada token ini.
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              {roles.map((role) => (
                <Button
                  key={role}
                  variant="secondary"
                  isLoading={loading === role}
                  disabled={loading !== null}
                  onClick={() => handleSelectRole(role)}
                  className="w-full justify-start">
                  Masuk sebagai {role}
                </Button>
              ))}
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <p className="mt-6 text-sm text-slate-500">
            <Link
              href="/login"
              className="font-semibold text-blue-700 hover:text-blue-800">
              Kembali ke login
            </Link>
          </p>
        </section>

        <section className="relative overflow-hidden rounded-[1.5rem] bg-slate-950 px-6 py-8 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.2),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.18),_transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
                Session ready
              </span>
              <h2 className="text-4xl font-black leading-tight">
                Satu akun, beberapa jalur kerja.
              </h2>
              <p className="max-w-md text-sm leading-6 text-slate-300">
                Admin, Seller, Buyer, dan Driver bisa dipilih tanpa membuat akun
                terpisah.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              {roles.map((role) => (
                <div
                  key={role}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">{role}</p>
                  <p className="mt-1">
                    Gunakan ketika Anda masuk sebagai {role.toLowerCase()}.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
