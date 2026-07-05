// app/seller/layout.tsx
import RoleGuard from "@/components/RoleGuard";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRole="Seller">{children}</RoleGuard>;
}
