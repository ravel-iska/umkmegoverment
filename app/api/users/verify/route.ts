import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "Penjual") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ktpProof, productProof, productDescription } = body;

    if (!ktpProof || !productProof || !productDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: session.id },
      data: {
        ktpProof,
        productProof,
        productDescription,
        verificationStatus: "Pending",
      },
    });

    return NextResponse.json({ success: true, status: updatedUser.verificationStatus });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
