import { NextRequest, NextResponse } from "next/server";
import { verifyToken, signToken } from "@/lib/jwt";

interface ActiveRoleBody {
  role: string;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Token tidak ditemukan" },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Token tidak valid atau kedaluwarsa" },
        { status: 401 },
      );
    }

    const { role }: ActiveRoleBody = await req.json();

    if (!role || !payload.roles.includes(role)) {
      return NextResponse.json(
        { error: "Role yang dipilih tidak dimiliki oleh user ini" },
        { status: 403 },
      );
    }

    const newToken = await signToken({
      sub: payload.sub,
      username: payload.username,
      roles: payload.roles,
      activeRole: role,
    });

    return NextResponse.json({
      message: `Active role berhasil diset ke ${role}`,
      token: newToken,
    });
  } catch (error) {
    console.error("[ACTIVE_ROLE_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
