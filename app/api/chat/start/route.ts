import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// Helper: Ambil sesi user ATAU admin berdasarkan konteks (referer)
async function getChatSession(request: Request) {
  const referer = request.headers.get("referer") || "";
  
  if (referer.includes("/admin")) {
    const adminSession = await getSession("admin_session");
    if (adminSession) return adminSession;
  }
  
  const userSession = await getSession("session");
  if (userSession) return userSession;
  
  return await getSession("admin_session"); // Fallback
}

// POST /api/chat/start - Buat atau dapatkan percakapan baru
export async function POST(request: Request) {
  try {
    const session = await getChatSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await request.json(); // null jika targetnya Admin Pusat

    // Cari percakapan yang sudah ada antara session.id (user1) dan targetUserId (user2)
    let conversation;

    if (targetUserId) {
      conversation = await db.conversation.findFirst({
        where: {
          OR: [
            { user1Id: session.id, user2Id: targetUserId },
            { user1Id: targetUserId, user2Id: session.id }
          ]
        }
      });
    } else {
      // Chat dengan Admin Pusat
      conversation = await db.conversation.findFirst({
        where: {
          user1Id: session.id,
          user2Id: null
        }
      });
    }

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          user1Id: session.id,
          user2Id: targetUserId || null
        }
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Chat Start Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
