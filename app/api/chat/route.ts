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

// GET /api/chat - List percakapan
export async function GET(request: Request) {
  try {
    const session = await getChatSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let conversations;

    if (session.role === "Admin") {
      // Admin Pusat melihat semua chat yang targetnya adalah Admin (user2Id = null)
      conversations = await db.conversation.findMany({
        where: { user2Id: null },
        include: {
          user1: { select: { id: true, name: true, avatar: true, email: true, role: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1, // Get latest message
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else {
      // Pembeli/Penjual melihat chat di mana mereka adalah user1 atau user2
      conversations = await db.conversation.findMany({
        where: {
          OR: [
            { user1Id: session.id },
            { user2Id: session.id }
          ]
        },
        include: {
          user1: { select: { id: true, name: true, avatar: true, email: true, role: true } },
          user2: { select: { id: true, name: true, avatar: true, email: true, role: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" }
      });
    }

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Chat GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
