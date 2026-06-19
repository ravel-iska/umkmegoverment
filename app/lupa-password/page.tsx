"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LupaPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      return setError("Email atau Nomor WhatsApp wajib diisi.");
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/lupa-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mereset password.");
        return;
      }

      setIsSuccess(true);
      toast.success("Password baru berhasil dikirim!");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="bg-primary p-2 rounded-xl">
              <ShieldAlert className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-black text-2xl tracking-tight text-primary">
              Pasar<span className="text-foreground">Podosari</span>
            </span>
          </Link>
          <p className="text-muted-foreground text-sm">Pemulihan Akses Akun</p>
        </div>

        <div className="bg-card border shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {isSuccess ? (
              <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Password Terkirim!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Kami telah mengirimkan password baru ke nomor WhatsApp Anda. Silakan periksa pesan Anda.
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button className="w-full rounded-xl" size="lg">
                      Kembali ke Halaman Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <h1 className="text-2xl font-bold tracking-tight">Lupa Password?</h1>
                  <p className="text-sm text-muted-foreground">
                    Masukkan nomor WhatsApp atau Email yang terdaftar pada akun Anda. Kami akan mengirimkan password baru melalui WhatsApp.
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
                    <label className="text-sm font-medium">Nomor WhatsApp atau Email</label>
                    <Input
                      type="text"
                      placeholder="Contoh: 08123456789 atau nama@email.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={isLoading}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl font-bold text-base" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Kirim Password Baru
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
