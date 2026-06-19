import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, createSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "Pembeli") {
      return NextResponse.json({ error: "Only buyers can be upgraded" }, { status: 400 });
    }

    // Update user in database
    const user = await db.user.update({
      where: { id: session.id },
      data: { role: "Penjual" }
    });

    // Update session cookie
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
    });

    return NextResponse.json({ success: true, message: "Upgraded to Penjual" });
  } catch (error) {
    console.error("Error upgrading user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
