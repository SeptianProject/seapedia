import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

    const body: ActiveRoleBody = await req.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { error: "Field 'role' wajib diisi" },
        { status: 400 },
      );
    }

    const userRole = await prisma.userRole.findFirst({
      where: {
        userId: payload.sub,
        role: { name: role },
      },
      include: { role: true },
    });

    if (!userRole) {
      return NextResponse.json(
        { error: `User tidak memiliki role '${role}'` },
        { status: 403 },
      );
    }

    const allUserRoles = await prisma.userRole.findMany({
      where: { userId: payload.sub },
      include: { role: true },
    });
    const roleNames = allUserRoles.map((ur) => ur.role.name);

    const newToken = await signToken({
      sub: payload.sub,
      username: payload.username,
      roles: roleNames,
      activeRole: userRole.role.name,
    });

    return NextResponse.json({
      message: `Active role berhasil diset ke ${userRole.role.name}`,
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
