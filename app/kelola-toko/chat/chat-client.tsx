"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, User, Search, Bot, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pusherClient } from "@/lib/pusher-client";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface ChatUser {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
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

export function SellerChatClient({ 
  initialConversations, 
  currentUserId 
}: { 
  initialConversations: Conversation[],
  currentUserId: string
}) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Refresh conversations dari server
  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to refresh conversations:", error);
    }
  }, []);

  // Fetch full conversation details when active changes
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

    // Subscribe to pusher channel
    const channel = pusherClient.subscribe(`chat-${activeConversationId}`);
    channel.bind("new-message", (message: Message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      
      // Update conversations list latest message
      setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId) {
          return { ...c, messages: [message], updatedAt: message.createdAt };
        }
        return c;
      }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    });

    return () => {
      pusherClient.unsubscribe(`chat-${activeConversationId}`);
    };
  }, [activeConversationId, fetchMessages]);

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
      refreshConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConversationId, refreshConversations]);

  // POLLING: Refresh list percakapan setiap 10 detik (untuk pesan baru dari user lain)
  useEffect(() => {
    if (activeConversationId) return; // Sudah di-handle oleh polling di atas

    const interval = setInterval(refreshConversations, 10000);
    return () => clearInterval(interval);
  }, [activeConversationId, refreshConversations]);

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
      senderId: currentUserId,
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
    if (conv.user1Id === currentUserId) return conv.user2?.name || "Pengguna";
    return conv.user1?.name || "Pengguna";
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm flex h-[calc(100vh-12rem)] overflow-hidden">
      {/* Sidebar / List Percakapan */}
      <div className="w-1/3 border-r flex flex-col bg-slate-50">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Pesan Masuk</h2>
            <button 
              onClick={refreshConversations}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari pesan..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground text-sm">
              Belum ada pesan masuk.
            </div>
          ) : (
            conversations.map(conv => {
              const latestMsg = conv.messages[0];
              const isActive = conv.id === activeConversationId;
              const partnerName = getChatPartnerName(conv);
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                    isActive ? "bg-emerald-50 border border-emerald-100" : "hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${conv.user2Id === null ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                    {conv.user2Id === null ? <Bot className="h-5 w-5 text-emerald-600" /> : <User className="h-5 w-5 text-slate-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-semibold text-sm truncate pr-2 text-foreground">{partnerName}</h4>
                      {latestMsg && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(latestMsg.createdAt), { addSuffix: true, locale: idLocale })}
                        </span>
                      )}
                    </div>
                    {latestMsg && (
                      <p className={`text-xs truncate ${latestMsg.senderId === currentUserId ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {latestMsg.senderId === currentUserId ? 'Anda: ' : ''}{latestMsg.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Area Chat Utama */}
      <div className="w-2/3 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-white">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeConversation.user2Id === null ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                {activeConversation.user2Id === null ? <Bot className="h-5 w-5 text-emerald-600" /> : <User className="h-5 w-5 text-slate-500" />}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{getChatPartnerName(activeConversation)}</h3>
                {activeConversation.user2Id === null && (
                  <p className="text-xs text-muted-foreground">Layanan Bantuan Resmi</p>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]"
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
                  Belum ada pesan.
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isMe 
                          ? 'bg-emerald-600 text-white rounded-tr-sm' 
                          : 'bg-white border text-foreground rounded-tl-sm'
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

            {/* Chat Input */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={sendMessage} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ketik balasan..."
                  className="flex-1 text-sm border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-slate-50 focus:bg-white transition-colors"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="rounded-xl px-6 bg-emerald-600 hover:bg-emerald-700 h-auto"
                >
                  <Send className="h-4 w-4 mr-2" /> Kirim
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-[#F8FAFC]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <MessageCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-medium text-foreground">Pilih Percakapan</h3>
            <p className="text-sm mt-1">Pilih pengguna di panel kiri untuk mulai membalas pesan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
