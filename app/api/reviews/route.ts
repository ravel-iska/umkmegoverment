import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/reviews?productId=xxx — ambil semua review produk
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId wajib diisi" }, { status: 400 });
  }

  const reviews = await db.review.findMany({
    where: { productId },
    include: {
      user: { select: { name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return NextResponse.json({ reviews, avgRating, total: reviews.length });
}

// POST /api/reviews — kirim review baru (hanya dari riwayat pembelian, pesanan harus Selesai)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Login diperlukan untuk memberi ulasan." }, { status: 401 });
    }

    const body = await request.json();
    const { productId, orderId, rating, comment, images } = body;

    if (!productId || !orderId || !rating) {
      return NextResponse.json({ error: "productId, orderId, dan rating wajib diisi." }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating harus antara 1-5." }, { status: 400 });
    }

    // Validasi: pastikan user benar-benar pernah membeli produk ini & pesanan sudah DIKIRIM/SELESAI
    const orderItem = await db.orderItem.findFirst({
      where: {
        orderId,
        productId,
        order: {
          userId: session.id,
          status: { in: ["Dikirim", "Selesai"] },
        },
      },
      include: {
        order: true
      }
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Anda hanya bisa mereview produk dari pesanan yang sudah dikirim/selesai." },
        { status: 403 }
      );
    }

    // Cek apakah sudah pernah review untuk order ini
    const existingReview = await db.review.findUnique({
      where: { userId_productId_orderId: { userId: session.id, productId, orderId } },
    });

    if (existingReview) {
      return NextResponse.json({ error: "Anda sudah pernah memberi ulasan untuk produk ini." }, { status: 409 });
    }

    const review = await db.review.create({
      data: {
        userId: session.id,
        productId,
        orderId,
        rating,
        comment: comment || null,
        images: images && images.length > 0 ? JSON.stringify(images) : null,
      },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });

    // Update rata-rata rating produk
    const allReviews = await db.review.findMany({ where: { productId }, select: { rating: true } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.product.update({
      where: { id: productId },
      data: { rating: Math.round(avgRating * 10) / 10 },
    });

    // Auto-complete pesanan jika statusnya masih Dikirim
    if (orderItem.order.status === "Dikirim") {
      await db.order.update({
        where: { id: orderId },
        data: { status: "Selesai" }
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Anda sudah pernah memberi ulasan untuk produk ini." }, { status: 409 });
    }
    console.error("Review error:", error);
    return NextResponse.json({ error: "Gagal menyimpan ulasan." }, { status: 500 });
  }
}

