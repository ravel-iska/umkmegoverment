import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        products: {
          include: { category: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formatted = user.products.map(p => ({
      id: p.id,
      nama: p.name,
      harga: p.price,
      stok: p.sold === 0 ? 100 : 100 - p.sold, // Simulasi stok
      kategori: p.category.name,
      terjual: p.sold
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return NextResponse.json({ error: "Failed to fetch seller products" }, { status: 500 });
  }
}
