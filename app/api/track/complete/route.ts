import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendInvoiceToWhatsapp } from "@/lib/fonnte";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID diperlukan." }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    if (order.status !== "Dikirim") {
      return NextResponse.json({ error: "Hanya pesanan berstatus Dikirim yang dapat diselesaikan." }, { status: 400 });
    }

    await db.order.update({
      where: { id: orderId },
      data: { status: "Selesai" },
    });

    const appUrl = request.headers.get("origin") || "http://localhost:3000";
    sendInvoiceToWhatsapp(orderId, appUrl).catch((err) =>
      console.error("Failed to send WA invoice:", err)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing order:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
