import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminChatClient } from "./chat-client";

export default async function AdminChatPage() {
  const session = await getSession("admin_session");
  if (!session || session.role !== "Admin") {
    redirect("/admin/login");
  }

  // Ambil semua percakapan yang ada, diurutkan dari yang terbaru diperbarui
  const conversations = await db.conversation.findMany({
    where: { user2Id: null },
    include: {
      user1: { select: { id: true, name: true, avatar: true, email: true, role: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // Hanya ambil pesan terakhir untuk preview di sidebar
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Support Chat</h1>
        <p className="text-muted-foreground mt-1">Balas pesan dari pembeli secara langsung.</p>
      </div>

      <AdminChatClient initialConversations={conversations} adminUserId={session.id} />
    </div>
  );
}
