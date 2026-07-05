"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-xl bg-white">
      <h1 className="text-2xl font-bold mb-6">Login ke SEAPEDIA</h1>

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
          required
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" isLoading={loading} className="w-full">
          Login
        </Button>
      </form>
    </div>
  );
}
