import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;
const secretKey = new TextEncoder().encode(JWT_SECRET);

const ROLE_ROUTE_MAP: Record<string, string> = {
  "/api/seller": "Seller",
  "/api/buyer": "Buyer",
  "/api/driver": "Driver",
  "/api/admin": "Admin",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const matchedPrefix = Object.keys(ROLE_ROUTE_MAP).find((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!matchedPrefix) {
    return NextResponse.next();
  }

  const requiredRole = ROLE_ROUTE_MAP[matchedPrefix];
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: token tidak ada" },
      { status: 401 },
    );
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const activeRole = payload.activeRole as string | undefined;

    if (!activeRole) {
      return NextResponse.json(
        {
          error: "Active role belum diset. Panggil /api/auth/active-role dulu.",
        },
        { status: 403 },
      );
    }

    if (activeRole !== requiredRole) {
      return NextResponse.json(
        { error: `Forbidden: rute ini hanya untuk role ${requiredRole}` },
        { status: 403 },
      );
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.sub as string);
    requestHeaders.set("x-active-role", activeRole);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    console.error("[MIDDLEWARE_JWT_ERROR]", error);
    return NextResponse.json(
      { error: "Token tidak valid atau kedaluwarsa" },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: [
    "/api/seller/:path*",
    "/api/buyer/:path*",
    "/api/driver/:path*",
    "/api/admin/:path*",
  ],
};
