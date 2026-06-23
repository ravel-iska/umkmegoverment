import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession("admin_session");
    
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const action = formData.get("action") as string;

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const status = action === "Approve" ? "Verified" : "Rejected";
    const isVerified = action === "Approve";

    await db.user.update({
      where: { id: userId },
      data: {
        verificationStatus: status,
        isVerified: isVerified
      }
    });

    // Redirect back to verification page
    const baseUrl = process.env.GOOGLE_REDIRECT_URI ? new URL(process.env.GOOGLE_REDIRECT_URI).origin : new URL(request.url).origin;
    return NextResponse.redirect(new URL("/admin/verifikasi-umkm", baseUrl));
  } catch (error) {
    console.error("Error processing verification:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
