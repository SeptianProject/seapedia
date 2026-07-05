"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-xl bg-white">
      <h1 className="text-2xl font-bold mb-2">Buat akun SEAPEDIA</h1>
      <p className="text-sm text-gray-500 mb-6">
        Daftarkan username, password, dan role yang ingin dipakai.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <span className="text-sm font-medium text-gray-700">Role</span>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((role) => (
              <label
                key={role}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <Button
          type="submit"
          isLoading={loading}
          disabled={!canSubmit}
          className="w-full">
          Register
        </Button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        Sudah punya akun?{" "}
        <a href="/login" className="text-blue-600 font-medium">
          Login
        </a>
      </p>
    </div>
  );
}
