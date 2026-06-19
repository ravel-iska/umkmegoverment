"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function processVerification(userId: string, action: "Approve" | "Reject") {
  const session = await getSession();
  
  if (!session || session.role !== "Admin") {
    return { error: "Unauthorized" };
  }

  try {
    const status = action === "Approve" ? "Verified" : "Rejected";
    const isVerified = action === "Approve";

    await db.user.update({
      where: { id: userId },
      data: {
        verificationStatus: status,
        isVerified: isVerified
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error processing verification:", error);
    return { error: "Terjadi kesalahan pada server" };
  }
}
