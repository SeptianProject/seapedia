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
      <nav className="h-16 border-b bg-white flex items-center px-6">
        <Link href="/" className="font-bold text-lg text-blue-600">
          SEAPEDIA
        </Link>
      </nav>
    );
  }

  return (
    <nav className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
      <Link href="/" className="font-bold text-lg text-blue-600">
        SEAPEDIA
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">
              {user.username} ·{" "}
              <span className="font-medium text-gray-900">
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
    </nav>
  );
}
