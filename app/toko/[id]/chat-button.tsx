"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openChatWith } from "@/components/chat/live-chat";

export function StoreChatButton({ sellerId }: { sellerId: string }) {
  return (
    <Button 
      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm px-6"
      onClick={() => openChatWith(sellerId)}
    >
      <MessageCircle className="w-4 h-4 mr-2" /> Chat Penjual
    </Button>
  );
}
