"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-client";

interface RoleGuardProps {
  allowedRole: "Admin" | "Seller" | "Buyer" | "Driver";
  children: ReactNode;
}

export default function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">(
    "checking",
  );

  useEffect(() => {
    const user = getCurrentUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.activeRole !== allowedRole) {
      router.replace("/select-role");
      return;
    }

    setStatus("allowed");
  }, [allowedRole, router]);

  if (status === "checking") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="rounded-2xl border border-white/70 bg-white/80 px-6 py-4 text-slate-500 shadow-sm backdrop-blur-sm">
          Memverifikasi akses...
        </div>
      </div>
    );
  }

  if (status === "denied") return null;

  return <>{children}</>;
}
