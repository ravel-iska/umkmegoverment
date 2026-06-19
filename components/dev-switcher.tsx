"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bug, User, ShieldCheck, Store, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export function DevSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { checkSession } = useAuth();

  // Hanya tampilkan di mode development
  if (process.env.NODE_ENV !== "development") return null;

  const accounts = [
    { name: "Admin Utama", email: "admin@pasarpodosari.id", role: "Admin", icon: ShieldCheck, color: "text-red-600 bg-red-100" },
    { name: "Warung Bu Siti", email: "warungbusiti@example.com", role: "Penjual", icon: Store, color: "text-emerald-600 bg-emerald-100" },
    { name: "John Doe", email: "johndoe@example.com", role: "Pembeli", icon: User, color: "text-blue-600 bg-blue-100" },
  ];

  const handleSwitch = async (email: string, role: string) => {
    try {
      const res = await fetch("/api/auth/dev-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Gagal ganti akun");
        return;
      }

      toast.success(`Berhasil ganti ke ${role}`);
      setIsOpen(false);
      
      // Update global store
      await checkSession();

      // Redirect otomatis
      if (role === "Admin") {
        router.push("/admin");
      } else if (role === "Penjual") {
        router.push("/kelola-toko");
      } else {
        router.push("/");
      }
      
      // Force reload untuk memastikan layout juga membaca cookie baru (Server Components)
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="bg-card border shadow-xl rounded-xl w-64 p-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
              <Bug className="h-3 w-3" /> Dev Switcher
            </p>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {accounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleSwitch(acc.email, acc.role)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${acc.color}`}>
                  <acc.icon className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">{acc.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{acc.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <Button 
        onClick={() => setIsOpen(!isOpen)}
        size="icon" 
        className="h-12 w-12 rounded-full shadow-lg bg-slate-800 hover:bg-slate-700 text-white border-2 border-white/20"
      >
        <Bug className="h-5 w-5" />
      </Button>
    </div>
  );
}
