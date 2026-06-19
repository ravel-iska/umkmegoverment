"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const activeTab = searchParams.get("tab") === "register" ? "register" : "login";
  const redirectTo = searchParams.get("redirect") || "";

  const [tab, setTab] = useState<string>(activeTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "GoogleLoginDibatalkan") setError("Login Google dibatalkan.");
      else if (errorParam === "InvalidGoogleCode") setError("Kode autentikasi Google tidak valid.");
      else if (errorParam === "ServerConfigurationError") setError("Sistem belum dikonfigurasi untuk Login Google.");
      else setError("Gagal masuk dengan Google.");
    }
  }, [searchParams]);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Pembeli",
  });

  useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    
    if (!loginForm.email || !loginForm.password) {
      return setError("Email & password wajib diisi.");
    }
    
    setIsLoading(true);
    try {
      // Panggil API login langsung — gunakan role dari response server, bukan Zustand
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email atau password salah.");
        return;
      }

      // Sinkronisasi Zustand store agar header juga terupdate
      const { useAuth } = await import("@/lib/auth");
      useAuth.setState({
        user: {
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          isLoggedIn: true,
        },
      });

      toast.success("Login berhasil! Selamat datang kembali.");

      // Redirect berdasarkan kelengkapan data dan role
      const role = data.user.role;
      if (!data.user.phone) {
        router.push("/lengkapi-profil");
      } else if (redirectTo) {
        router.push(redirectTo);
      } else if (role === "Admin") {
        router.push("/admin");
      } else if (role === "Penjual") {
        router.push("/kelola-toko");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem saat mencoba masuk.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.phone) {
      return setError("Semua kolom pendaftaran wajib diisi, termasuk nomor WhatsApp.");
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan registrasi.");
      }

      toast.success("Registrasi berhasil! Silakan masuk ke akun Anda.");
      setSuccessMsg("Pendaftaran berhasil! Silakan masuk menggunakan email Anda.");
      setLoginForm({ email: registerForm.email, password: "" });
      
      // Reset register form & switch tab to login
      setRegisterForm({ name: "", email: "", phone: "", password: "", role: "Pembeli" });
      setTab("login");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat melakukan registrasi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card rounded-2xl border shadow-lg p-6 sm:p-8">
      {/* Logo */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-4 relative">
          <Image
            src="/images/logo-pringsewu.png"
            alt="Logo Pringsewu"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold mb-1">
          Pasar <span className="text-primary">Podosari</span>
        </h1>
        <p className="text-xs text-muted-foreground">Portal Akses UMKM & Pelanggan Lokal</p>
      </div>

      {/* Message Notifications */}
      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-xl px-4 py-2.5 text-sm mb-4 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl px-4 py-2.5 text-sm mb-4 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Tabs System */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full rounded-xl p-1 bg-muted">
          <TabsTrigger value="login" className="rounded-lg font-semibold text-xs sm:text-sm">Masuk</TabsTrigger>
          <TabsTrigger value="register" className="rounded-lg font-semibold text-xs sm:text-sm">Daftar</TabsTrigger>
        </TabsList>

        {/* LOGIN TAB */}
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  className="pl-10 rounded-xl h-11"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-foreground">Kata Sandi</label>
                <Link href="/lupa-password" className="text-xs text-primary hover:underline font-medium" tabIndex={-1}>
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="pl-10 pr-10 rounded-xl h-11"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl h-11 font-bold text-sm shadow-md mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Masuk ke Akun"}
            </Button>

            <div className="relative mt-6 mb-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Atau lanjutkan dengan</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl h-11 font-medium text-sm"
              onClick={() => window.location.href = "/api/auth/google"}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
          </form>
        </TabsContent>

        {/* REGISTER TAB */}
        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nama Lengkap"
                  className="pl-10 rounded-xl h-11"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  className="pl-10 rounded-xl h-11"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Nomor WhatsApp</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">WA</span>
                <Input
                  type="tel"
                  placeholder="081234567890"
                  className="pl-12 rounded-xl h-11"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat kata sandi minimal 6 karakter"
                  className="pl-10 pr-10 rounded-xl h-11"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Daftar Sebagai</label>
              <div className="relative">
                <select
                  className="w-full border rounded-xl px-3 h-11 bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                >
                  <option value="Pembeli">Pembeli (Pelanggan)</option>
                  <option value="Penjual">Penjual (UMKM)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl h-11 font-bold text-sm shadow-md mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Daftar Akun Baru"}
            </Button>

            <div className="relative mt-6 mb-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Atau daftar dengan</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl h-11 font-medium text-sm"
              onClick={() => window.location.href = "/api/auth/google"}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <Separator className="my-6" />
      
      <div className="text-center">
        <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 font-medium">
          Kembali ke Halaman Utama <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md bg-card border rounded-2xl p-8 shadow-lg text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm font-medium">Memuat portal autentikasi...</p>
        </div>
      }>
        <AuthForm />
      </Suspense>
    </div>
  );
}
