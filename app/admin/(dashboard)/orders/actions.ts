"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { sendRekberVerifiedNotification } from "@/lib/fonnte";

export async function verifyOrderPayment(orderId: string) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    throw new Error("Unauthorized");
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Pesanan tidak ditemukan");

  if (order.status !== "Menunggu Verifikasi") {
    throw new Error("Status pesanan tidak valid untuk diverifikasi.");
  }

  // Update order status to "Diproses"
  await db.order.update({
    where: { id: orderId },
    data: { status: "Diproses" }
  });

  // Kirim Notifikasi WhatsApp ke Penjual & Pembeli (Rekber workflow)
  try {
    await sendRekberVerifiedNotification(orderId);
  } catch (err) {
    console.error("Gagal mengirim notifikasi WhatsApp:", err);
    // Tidak di-throw error agar proses verifikasi tetap berhasil secara sistem
  }

  revalidatePath("/admin/orders");
  return { success: true };
}

export async function rejectOrderPayment(orderId: string) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    throw new Error("Unauthorized");
  }

  await db.order.update({
    where: { id: orderId },
    data: { status: "Dibatalkan" }
  });

  revalidatePath("/admin/orders");
  return { success: true };
}
