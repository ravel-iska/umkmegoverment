import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = users.map(u => ({
      id: u.id,
      email: u.email,
      nama: u.name,
      role: u.role,
      bergabung: u.createdAt.toISOString().split("T")[0],
      transaksi: u._count.orders
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
