import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PUT(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id as string;

    const body = await req.json();
    const { name, phone, address, avatar, coverImages } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama toko wajib diisi" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        address,
        avatar,
        coverImages,
      },
    });

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil toko" },
      { status: 500 }
    );
  }
}
