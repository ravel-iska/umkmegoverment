"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Send, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export default function LengkapiProfilPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      return setError("Nomor WhatsApp wajib diisi.");
    }

    if (phone.length < 9 || phone.length > 15) {
      return setError("Format nomor WhatsApp tidak valid.");
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/users/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan nomor WhatsApp.");
        return;
      }

      toast.success("Nomor WhatsApp berhasil disimpan!");
      
      // Update role/redirect logic
      if (user?.role === "Admin") {
        router.push("/admin");
      } else if (user?.role === "Penjual") {
        router.push("/kelola-toko");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem saat menyimpan nomor WhatsApp.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border shadow-xl rounded-2xl overflow-hidden p-6 sm:p-8">
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Phone className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Satu Langkah Lagi!</h1>
            <p className="text-sm text-muted-foreground">
              Demi keamanan dan kelancaran transaksi, mohon lengkapi nomor WhatsApp Anda yang aktif sebelum melanjutkan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor WhatsApp</label>
              <Input
                type="text"
                placeholder="Contoh: 08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                className="h-12 rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Nomor ini akan digunakan penjual/pembeli untuk menghubungi Anda terkait pesanan.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-bold text-base mt-2" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  Simpan & Lanjutkan
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
