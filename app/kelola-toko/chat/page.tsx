import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { SellerChatClient } from "./chat-client";

export default async function SellerChatPage() {
  const session = await getSession();
  if (!session || session.role !== "Penjual") {
    redirect("/login");
  }

  // Ambil percakapan di mana seller terlibat (baik sebagai user1 atau user2)
  const conversations = await db.conversation.findMany({
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
        take: 1, // Hanya ambil pesan terakhir untuk preview di sidebar
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pesan Masuk</h1>
        <p className="text-muted-foreground mt-1">Kelola pertanyaan dari pembeli dan hubungi Admin Pusat.</p>
      </div>

      <SellerChatClient initialConversations={conversations as any} currentUserId={session.id} />
    </div>
  );
}
