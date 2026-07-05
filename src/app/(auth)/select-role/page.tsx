"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-xl bg-white">
      <h1 className="text-2xl font-bold mb-2">Pilih Role Aktif</h1>
      <p className="text-gray-500 mb-6">
        Akun Anda memiliki beberapa role. Pilih salah satu untuk melanjutkan.
      </p>

      <div className="flex flex-col gap-3">
        {roles.map((role) => (
          <Button
            key={role}
            variant="secondary"
            isLoading={loading === role}
            disabled={loading !== null}
            onClick={() => handleSelectRole(role)}
            className="w-full">
            Masuk sebagai {role}
          </Button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  );
}
