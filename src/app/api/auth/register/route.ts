import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

interface RegisterBody {
  username: string;
  password: string;
  roles: string[];
}

const VALID_ROLES = ["Admin", "Seller", "Buyer", "Driver"];

export async function POST(req: NextRequest) {
  try {
    const body: RegisterBody = await req.json();
    const { username, password, roles } = body;

    if (!username || !password || !roles?.length) {
      return NextResponse.json(
        { error: "username, password, dan roles wajib diisi" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 },
      );
    }

    const invalidRoles = roles.filter((r) => !VALID_ROLES.includes(r));
    if (invalidRoles.length > 0) {
      return NextResponse.json(
        { error: `Role tidak valid: ${invalidRoles.join(", ")}` },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 409 },
      );
    }

    const roleRecords = await prisma.role.findMany({
      where: { name: { in: roles } },
    });

    if (roleRecords.length !== roles.length) {
      return NextResponse.json(
        { error: "Salah satu role belum ter-seed di database" },
        { status: 500 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          userRoles: {
            create: roleRecords.map((role) => ({ roleId: role.id })),
          },
        },
        include: { userRoles: { include: { role: true } } },
      });
      return user;
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: {
          id: newUser.id,
          username: newUser.username,
          roles: newUser.userRoles.map((ur) => ur.role.name),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
