"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Heart, ShoppingCart, User, Menu, X, MapPin, Store,
  LayoutDashboard, ShieldCheck, LogOut, UserPlus, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/produk", label: "Produk" },
  { href: "/profil-desa", label: "Profil Desa" },
  { href: "/lacak-pesanan", label: "Lacak Pesanan" },
  { href: "/tentang-kami", label: "Tentang Kami" },
  { href: "/hubungi-kami", label: "Hubungi Kami" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useStore((state) => state.getCartCount());
  const { user, logout, upgradeToSeller, checkSession } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Sinkronisasi status autentikasi dari server (cookie) pada saat muat
  useEffect(() => {
    checkSession();
    setIsMounted(true);
  }, [checkSession]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleUpgradeToSeller = async () => {
    const res = await upgradeToSeller();
    if (res?.success) {
      router.push("/kelola-toko");
    } else {
      alert("Gagal memproses permintaan toko Anda.");
    }
  };

  // Badge warna sesuai role
  const roleBadge: Record<string, string> = {
    Admin: "bg-red-100 text-red-700",
    Penjual: "bg-emerald-100 text-emerald-700",
    Pembeli: "bg-blue-100 text-blue-700",
  };

  return (
    <header className="sticky top-0 z-50 bg-background">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Desa Podosari, Lampung</span>
          </div>
          <div className="hidden md:block">
            <span>Dukung Produk Lokal Indonesia</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">Pasar Podosari</h1>
                <p className="text-xs text-primary">Marketplace Desa</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                 
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {/* Menu Kelola Toko — hanya Penjual */}
              {user?.role === "Penjual" && (
                <Link
                  href="/kelola-toko"
                 
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1",
                    pathname === "/kelola-toko"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Package className="h-4 w-4" />
                  Kelola Toko
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/keranjang" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  <span suppressHydrationWarning>
                    {isMounted && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                        {cartCount}
                      </span>
                    )}
                  </span>
                </Button>
              </Link>

              {/* ─── Dropdown User ─── */}
              {user?.isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden md:flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="max-w-[100px] truncate">
                        {user.name}
                      </span>
                      {user.role && (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", roleBadge[user.role])}>
                          {user.role}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link href="/profil" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" /> Profil Saya
                      </Link>
                    </DropdownMenuItem>

                    {/* ADMIN */}
                    {user.role === "Admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 text-red-600">
                          <ShieldCheck className="h-4 w-4" /> Dashboard Admin
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* PENJUAL */}
                    {user.role === "Penjual" && (
                      <DropdownMenuItem asChild>
                        <Link href="/kelola-toko" className="flex items-center gap-2 text-emerald-700">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard Toko
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-destructive cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" /> Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/10">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Masuk / Daftar
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                   
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                {user?.role === "Penjual" && (
                  <Link
                    href="/kelola-toko"
                   
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" /> Kelola Toko
                  </Link>
                )}

                {user?.role === "Admin" && (
                  <Link
                    href="/admin"
                   
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" /> Dashboard Admin
                  </Link>
                )}

                <div className="border-t my-2" />

                {user?.isLoggedIn ? (
                  <>
                    <Link
                      href="/profil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted flex items-center gap-2"
                    >
                      <User className="h-4 w-4" /> Profil Saya
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 text-left flex items-center gap-2"
                    >
                    <LogOut className="h-4 w-4" /> Keluar ({user.name})
                  </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-4 py-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl border-primary text-primary">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Masuk / Daftar
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
