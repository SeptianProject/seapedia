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
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Memverifikasi akses...</p>
      </div>
    );
  }

  if (status === "denied") return null;

  return <>{children}</>;
}
