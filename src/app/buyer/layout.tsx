// app/buyer/layout.tsx
import RoleGuard from "@/components/RoleGuard";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRole="Buyer">{children}</RoleGuard>;
}
