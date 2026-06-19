import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");

    let whereClause: any = { stock: { gt: 0 } };
    if (featured === "true") {
      whereClause.featured = true;
    }

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        category: true,
        seller: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
