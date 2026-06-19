import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID atau Nomor Resi diperlukan." }, { status: 400 });
    }

    const order = await db.order.findFirst({
      where: { 
        OR: [
          { id: { startsWith: orderId } },
          { trackingNumber: { equals: orderId } },
          { trackingNumber: { contains: orderId } }
        ]
      },
      include: {
        user: true,
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    // Only return necessary fields
    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        trackingNumber: order.trackingNumber,
        paymentMethod: order.paymentMethod,
        items: order.items,
      }
    });

  } catch (error) {
    console.error("Error tracking order:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat melacak pesanan." }, { status: 500 });
  }
}
