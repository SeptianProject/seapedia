"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  clearToken,
  getDashboardPath,
  DecodedToken,
} from "@/lib/auth-client";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setMounted(true);
  }, []);

  function handleLogout() {
    clearToken();
    setUser(null);
    window.location.href = "/";
  }

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link
            href="/"
            className="text-lg font-black tracking-[0.2em] text-blue-700">
            SEAPEDIA
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-black tracking-[0.2em] text-blue-700">
          SEAPEDIA
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600 md:inline-flex">
                {user.username} ·{" "}
                <span className="ml-1 font-semibold text-slate-900">
                  {user.activeRole ?? "Belum pilih role"}
                </span>
              </span>
              <Link href={getDashboardPath(user.activeRole)}>
                <Button variant="secondary">Dashboard</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
