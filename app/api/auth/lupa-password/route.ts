import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json({ error: "Email atau Nomor WhatsApp wajib diisi" }, { status: 400 });
    }

    let user;
    let normalizedPhone = "";

    // Deteksi apakah input berupa email atau nomor HP
    const isEmail = identifier.includes("@");

    if (isEmail) {
      user = await db.user.findUnique({
        where: { email: identifier.trim() }
      });
    } else {
      // Normalisasi nomor telepon
      normalizedPhone = identifier.trim().replace(/[^0-9]/g, "");
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "62" + normalizedPhone.slice(1);
      } else if (!normalizedPhone.startsWith("62")) {
        normalizedPhone = "62" + normalizedPhone;
      }

      const possiblePhones = [
        normalizedPhone,
        "0" + normalizedPhone.slice(2), // 08...
        normalizedPhone.slice(2), // 8...
      ];

      user = await db.user.findFirst({
        where: {
          phone: {
            in: possiblePhones
          }
        }
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Data pengguna tidak ditemukan di sistem kami." }, { status: 404 });
    }

    if (!user.phone) {
      return NextResponse.json({ error: "Akun ini belum memiliki nomor WhatsApp terdaftar. Silakan hubungi administrator." }, { status: 400 });
    }

    // Jika yang diinput adalah email, kita tetap butuh normalizedPhone untuk dikirimi WA
    if (isEmail && user.phone) {
      normalizedPhone = user.phone.trim().replace(/[^0-9]/g, "");
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "62" + normalizedPhone.slice(1);
      } else if (!normalizedPhone.startsWith("62")) {
        normalizedPhone = "62" + normalizedPhone;
      }
    }

    // Generate random 8 character password
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Kirim WA via Fonnte
    const token = process.env.FONNTE_TOKEN;
    if (token) {
      const waMessage = `Halo *${user.name}*,

Permintaan reset password Anda berhasil diproses.
Berikut adalah detail login baru Anda di *Pasar Podosari*:

📧 Email: ${user.email}
🔑 Password Baru: *${newPassword}*

Silakan login menggunakan password baru ini dan segera ubah password Anda di menu Pengaturan demi keamanan.

Salam,
Admin Pasar Podosari`;

      const fd = new FormData();
      fd.append("target", normalizedPhone);
      fd.append("message", waMessage);
      
      try {
        await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: { Authorization: token },
          body: fd,
        });
      } catch (waErr) {
        console.error("[Fonnte Lupa Password] Error sending WA:", waErr);
        // Tetap lanjut meski gagal kirim wa (mungkin token expired/limit) tapi kembalikan warning
      }
    }

    return NextResponse.json({
      message: "Password baru telah dikirim ke nomor WhatsApp Anda."
    });

  } catch (error) {
    console.error("Error reset password:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem saat memproses permintaan Anda." }, { status: 500 });
  }
}
