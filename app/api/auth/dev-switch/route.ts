import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  // Hanya izinkan di environment development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Hanya tersedia di mode development" }, { status: 403 });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Buat sesi tanpa mengecek password
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
    });

    return NextResponse.json({
      message: "Berhasil ganti akun ke " + user.role,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Error switching account:", error);
    return NextResponse.json({ error: "Gagal ganti akun" }, { status: 500 });
  }
}
