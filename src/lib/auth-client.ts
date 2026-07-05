export interface DecodedToken {
  sub: string;
  username: string;
  roles: string[];
  activeRole?: string;
  exp: number;
}

const TOKEN_KEY = "seapedia_token";

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const payloadBase64 = token.split(".")[1];
    const decoded = JSON.parse(atob(payloadBase64));
    return decoded as DecodedToken;
  } catch {
    return null;
  }
}

export function getCurrentUser(): DecodedToken | null {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  if (decoded.exp * 1000 < Date.now()) {
    clearToken();
    return null;
  }

  return decoded;
}

export function getDashboardPath(activeRole?: string): string {
  const map: Record<string, string> = {
    Admin: "/admin/dashboard",
    Seller: "/seller/dashboard",
    Buyer: "/buyer/cart",
    Driver: "/driver/orders",
  };
  return map[activeRole ?? ""] ?? "/select-role";
}
