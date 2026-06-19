import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir." }, { status: 401 });
    }

    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: "Nomor WhatsApp wajib diisi." }, { status: 400 });
    }

    // Perbarui data phone di database
    await db.user.update({
      where: { id: session.id },
      data: { phone },
    });

    return NextResponse.json({ message: "Nomor WhatsApp berhasil disimpan." });
  } catch (error) {
    console.error("Error updating phone:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal peladen." }, { status: 500 });
  }
}
