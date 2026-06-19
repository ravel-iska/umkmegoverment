import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/reviews/eligible?productId=xxx
// Returns orders where the logged-in user bought this product and can leave a review
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ orders: [], alreadyReviewed: false });
  }

  if (!productId) {
    return NextResponse.json({ error: "productId wajib diisi" }, { status: 400 });
  }

  // Cari semua order milik user yang mengandung produk ini & sudah diproses
  const orders = await db.order.findMany({
    where: {
      userId: session.id,
      status: { in: ["Diproses", "Dikirim", "Selesai"] },
      items: {
        some: { productId },
      },
    },
    select: {
      id: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return NextResponse.json({ orders: [], alreadyReviewed: false });
  }

  // Cek apakah sudah ada review untuk salah satu order ini
  const existingReview = await db.review.findFirst({
    where: {
      userId: session.id,
      productId,
      orderId: { in: orders.map((o) => o.id) },
    },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({ orderId: o.id, orderDate: o.createdAt })),
    alreadyReviewed: !!existingReview,
  });
}
