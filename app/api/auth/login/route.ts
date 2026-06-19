import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    if (user.role === "Admin") {
      return NextResponse.json({ error: "Akun Admin harus login melalui portal khusus: /admin/login" }, { status: 403 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ error: "Akun Anda telah diblokir. Hubungi Administrator." }, { status: 403 });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    
    if (!passwordMatch) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // Buat sesi HTTP-Only Cookie
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
    });

    return NextResponse.json({
      message: "Login berhasil",
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
}
