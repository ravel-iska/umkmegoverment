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

// GET /api/chat/[conversationId] - Ambil pesan dalam percakapan tertentu
export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getChatSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user1: { select: { id: true, name: true, avatar: true, email: true, role: true } },
        user2: { select: { id: true, name: true, avatar: true, email: true, role: true } },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Validasi akses:
    // - Admin boleh akses semua conversation yang user2Id = null (support chat)
    // - User biasa hanya boleh akses conversation mereka sendiri
    if (session.role === "Admin") {
      // Admin boleh lihat chat support (user2Id = null)
      // Jika nanti ada chat antar user, admin tetap boleh lihat untuk moderasi
    } else if (conversation.user1Id !== session.id && conversation.user2Id !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Chat detail GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
