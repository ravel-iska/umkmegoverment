import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nama, email, dan password wajib diisi" }, { status: 400 });
    }

    // Wajibkan nomor WA untuk penjual
    if ((role === "Penjual" || !role) && !phone) {
      return NextResponse.json({ error: "Nomor WhatsApp wajib diisi untuk Penjual" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "Penjual",
        phone: phone || null,
      },
    });

    return NextResponse.json({
      message: "Registrasi berhasil",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ error: "Gagal mendaftar" }, { status: 500 });
  }
}
