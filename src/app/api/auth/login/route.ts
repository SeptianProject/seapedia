import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

interface LoginBody {
  username: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: LoginBody = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "username dan password wajib diisi" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 },
      );
    }

    const roleNames = user.userRoles.map((ur) => ur.role.name);

    const token = await signToken({
      sub: user.id,
      username: user.username,
      roles: roleNames,
    });

    return NextResponse.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        roles: roleNames,
      },
    });
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
