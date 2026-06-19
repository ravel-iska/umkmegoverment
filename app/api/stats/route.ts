import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const totalUser = await db.user.count();
    const totalTransaksi = await db.order.count();
    const totalPenjual = await db.user.count({ where: { role: "Penjual" } });
    
    // Asumsi untuk skripsi: ambil total amount dari semua order (bisa null jika kosong)
    const result = await db.order.aggregate({
      _sum: { totalAmount: true }
    });
    
    const pendapatan = result._sum.totalAmount || 0;

    return NextResponse.json({
      totalUser,
      totalTransaksi,
      totalPenjual,
      pendapatan
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
