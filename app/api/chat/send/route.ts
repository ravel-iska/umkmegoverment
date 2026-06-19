import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { pusherServer } from "@/lib/pusher-server";

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

// POST /api/chat/send - Mengirim pesan
export async function POST(request: Request) {
  try {
    const session = await getChatSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, content, targetUserId } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    let activeConversationId = conversationId;

    // Jika conversationId belum ada, maka buat atau ambil dari targetUserId
    if (!activeConversationId) {
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
        // Ke Admin
        conversation = await db.conversation.findFirst({
          where: { user1Id: session.id, user2Id: null }
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
      activeConversationId = conversation.id;
    } else {
      // Validasi akses jika conversationId diberikan
      const conv = await db.conversation.findUnique({ where: { id: activeConversationId } });
      if (!conv) {
         return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
      // Admin boleh akses semua conversation yang user2Id = null (chat ke admin)
      if (session.role !== "Admin" && conv.user1Id !== session.id && conv.user2Id !== session.id) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Untuk senderId: gunakan ID user asli, bukan string "ADMIN"
    // Karena model Message punya relasi FK ke User, senderId HARUS berupa UUID valid.
    // Di sisi frontend, kita bedakan pesan admin berdasarkan session.role.
    const senderId = session.id;

    // Simpan pesan ke DB
    const message = await db.message.create({
      data: {
        content,
        senderId: senderId,
        conversationId: activeConversationId,
      },
    });

    // Update waktu terakhir percakapan aktif
    await db.conversation.update({
      where: { id: activeConversationId },
      data: { updatedAt: new Date() },
    });

    // Trigger event Pusher (graceful — tidak crash jika mock_key)
    try {
      await pusherServer.trigger(`chat-${activeConversationId}`, "new-message", message);
    } catch (pusherError) {
      console.warn("⚠️ Pusher trigger failed (kredensial belum diatur):", pusherError instanceof Error ? pusherError.message : "Unknown error");
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Chat Send Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
