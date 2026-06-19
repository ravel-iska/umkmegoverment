"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, MessageSquare, X, Send, User, Bot, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { pusherClient } from "@/lib/pusher-client";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface ChatUser {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string | null;
  user1: ChatUser;
  user2: ChatUser | null;
  messages: Message[];
  updatedAt: string;
}

// Tambahkan event bus untuk membuka chat spesifik (contoh: dari tombol "Chat Penjual")
export const openChatWith = (targetUserId: string | null) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-chat", { detail: { targetUserId } }));
  }
};

export function LiveChatBubble({ currentUserId }: { currentUserId?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationsLoading, setIsConversationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);

  // Sembunyikan bubble di dashboard admin (tetap tampilkan di kelola-toko)
  const isHidden = pathname?.startsWith("/admin");

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // Handle Event Bus (Buka dari komponen lain)
  useEffect(() => {
    const handleOpenChat = async (e: any) => {
      setIsOpen(true);
      const targetUserId = e.detail.targetUserId;
      await startConversation(targetUserId);
    };

    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []);

  // Fetch semua percakapan
  const fetchConversations = useCallback(async () => {
    setIsConversationsLoading(true);
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsConversationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !activeConversationId) {
      fetchConversations();
    }
  }, [isOpen, activeConversationId, fetchConversations]);

  // Fetch messages jika activeConversationId berubah
  const fetchMessages = useCallback(async () => {
    if (!activeConversationId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chat/${activeConversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) return;

    fetchMessages();

    if (!pusherClient) return;

    const channel = pusherClient.subscribe(`chat-${activeConversationId}`);
    channel.bind("new-message", (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      // Update daftar percakapan juga jika sedang melihat chat list
      setConversations(prev => prev.map(c => 
        c.id === activeConversationId 
          ? { ...c, messages: [message], updatedAt: message.createdAt }
          : c
      ).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

      if (!isOpenRef.current && message.senderId !== currentUserId) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      pusherClient.unsubscribe(`chat-${activeConversationId}`);
    };
  }, [activeConversationId, currentUserId, fetchMessages]);

  // POLLING: Refresh pesan setiap 5 detik (fallback karena Pusher belum aktif)
  useEffect(() => {
    if (!activeConversationId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/${activeConversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch {
        // Silent fail
      }
      fetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConversationId, fetchConversations]);

  // POLLING: Refresh list percakapan setiap 10 detik
  useEffect(() => {
    if (activeConversationId) return; // Sudah di-handle oleh polling di atas
    if (!isOpen) return; // Jangan polling jika chat window tertutup

    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [activeConversationId, isOpen, fetchConversations]);

  // PUSHER GLOBAL LISTENER: Menunggu pesan baru meskipun chat tertutup (Untuk Notifikasi)
  useEffect(() => {
    if (!currentUserId || !pusherClient) return;
    
    // Subscribe ke private channel user untuk notifikasi chat
    // Karena kita tidak punya private channel spesifik per user, kita gunakan logika polling sederhana 
    // atau biarkan user melihat update saat mereka buka bubble.
    // Jika ingin realtime total notif, kita perlu mem-bind ke user channel (e.g., `user-${currentUserId}`)
    // Tapi karena implementasi saat ini menggunakan channel per-conversation, 
    // kita berlangganan ke SEMUA percakapan yang dimilikinya
    conversations.forEach(c => {
      if (c.id === activeConversationId) return; // sudah dilanggan di atas
      const channelName = `chat-${c.id}`;
      // Jika belum di-subscribe
      if (!pusherClient.channel(channelName)) {
        const channel = pusherClient.subscribe(channelName);
        channel.bind("new-message", (message: Message) => {
           if (message.senderId !== currentUserId) {
             if (!isOpenRef.current) setUnreadCount(prev => prev + 1);
             fetchConversations(); // refresh list
           }
        });
      }
    });

  }, [conversations, currentUserId, activeConversationId]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeConversationId]);

  const startConversation = async (targetUserId: string | null) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveConversationId(data.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    const messageText = newMessage;
    setNewMessage("");

    // Optimistic UI
    const tempId = Date.now().toString();
    const tempMessage: Message = {
      id: tempId,
      content: messageText,
      senderId: currentUserId || "ANONYMOUS",
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageText,
          conversationId: activeConversationId
        }),
      });

      if (!res.ok) throw new Error("Failed to send");
      const savedMessage = await res.json();
      setMessages(prev => prev.map(m => m.id === tempId ? savedMessage : m));
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const getChatPartnerName = (conv: Conversation) => {
    if (conv.user2Id === null) return "Admin Pusat Bantuan";
    // Cari siapa yang bukan kita
    if (conv.user1Id === currentUserId) return conv.user2?.name || "Pengguna Tidak Diketahui";
    return conv.user1?.name || "Pengguna Tidak Diketahui";
  };

  if (isHidden || !currentUserId) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-emerald-600 text-white rounded-full shadow-xl hover:bg-emerald-700 transition-all z-50 flex items-center justify-center hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white border shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col h-[500px] max-h-[80vh] animate-in slide-in-from-bottom-4 duration-300">
          
          {/* TAMPILAN INBOX (Jika tidak ada percakapan aktif) */}
          {!activeConversationId ? (
            <>
              <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-sm">Pesan Masuk</h3>
                  <button onClick={fetchConversations} className="text-emerald-100 hover:text-white" title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-emerald-100 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-3 bg-slate-50 border-b">
                <Button 
                  className="w-full bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => startConversation(null)} // Start with Admin
                >
                  <Bot className="w-4 h-4 mr-2" /> Tanya Bantuan Admin
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isConversationsLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center space-y-2">
                    <MessageCircle className="h-10 w-10 opacity-20" />
                    <p className="text-sm">Belum ada percakapan. Mulai ngobrol sekarang!</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map(conv => {
                      const partnerName = getChatPartnerName(conv);
                      const latestMsg = conv.messages[0];
                      return (
                        <button 
                          key={conv.id} 
                          className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3"
                          onClick={() => setActiveConversationId(conv.id)}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${conv.user2Id === null ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                            {conv.user2Id === null ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                              <h4 className="font-semibold text-sm truncate pr-2">{partnerName}</h4>
                              {latestMsg && (
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {formatDistanceToNow(new Date(latestMsg.createdAt), { addSuffix: true, locale: idLocale })}
                                </span>
                              )}
                            </div>
                            {latestMsg && (
                              <p className="text-xs text-muted-foreground truncate">
                                {latestMsg.senderId === currentUserId || latestMsg.senderId === "ADMIN" && currentUserId === undefined ? 'Anda: ' : ''}{latestMsg.content}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* TAMPILAN PERCAKAPAN AKTIF */
            <>
              {/* Header Percakapan Aktif */}
              <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveConversationId(null)} className="mr-1 text-emerald-100 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm truncate max-w-[150px]">
                      {conversations.find(c => c.id === activeConversationId) 
                        ? getChatPartnerName(conversations.find(c => c.id === activeConversationId)!) 
                        : "Memuat..."}
                    </h3>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-emerald-100 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* WA Fallback Banner (Hanya jika chat dengan Admin) */}
              {conversations.find(c => c.id === activeConversationId)?.user2Id === null && (
                <div className="bg-emerald-50 px-4 py-2 flex items-center justify-between border-b border-emerald-100 text-xs">
                  <span className="text-emerald-800 font-medium">Butuh respon cepat?</span>
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-1 rounded-md font-bold hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" /> Hubungi WA
                  </a>
                </div>
              )}

              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="animate-spin rounded-full h-8 w-8 text-emerald-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2">
                    <MessageCircle className="h-10 w-10 opacity-20" />
                    <p className="text-sm">Mulai obrolan Anda di sini.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId || (msg.senderId === "ADMIN" && currentUserId === undefined);
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          isMe 
                            ? 'bg-emerald-600 text-white rounded-br-sm' 
                            : 'bg-white border text-foreground rounded-bl-sm'
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik pesan..."
                    className="flex-1 text-sm border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-slate-50 focus:bg-white"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!newMessage.trim()}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
