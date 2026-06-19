"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Tags,
  Package,
  ListOrdered,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  History,
  MessageCircle
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "admin" })
    });
    window.location.href = "/admin/login";
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Verifikasi UMKM", href: "/admin/verifikasi-umkm", icon: ShieldCheck },
    { name: "Pesan Masuk", href: "/admin/chat", icon: MessageCircle },
    { name: "Transaksi", href: "/admin/orders", icon: ListOrdered },
    { name: "Riwayat Transaksi", href: "/admin/riwayat", icon: History },
    { name: "Pengguna", href: "/admin/users", icon: Users },
    { name: "Kategori", href: "/admin/categories", icon: Tags },
    { name: "Produk", href: "/admin/products", icon: Package },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden bg-background"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-card border-r shadow-sm transition-all duration-300 flex flex-col overflow-x-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >
        <div className={`h-16 flex items-center border-b transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-between px-6 shrink-0'}`}>
          <Link 
            href="/admin" 
            className={`font-bold text-xl text-primary flex items-center overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
          >
            Pasar Podosari
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={`hidden md:flex text-muted-foreground hover:bg-muted shrink-0 ${isCollapsed ? 'w-10 h-10' : ''}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className={`border-b overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'h-0 p-0 opacity-0 border-transparent' : 'h-[72px] p-6 pb-2 opacity-100'}`}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Admin Panel
          </p>
          <p className="text-sm font-medium truncate">{userName}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${isCollapsed ? "w-10 h-10 justify-center mx-auto" : "px-3 py-2.5"}`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t pb-8" suppressHydrationWarning>
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Keluar" : undefined}
            className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 ${
              isCollapsed ? "w-10 h-10 justify-center mx-auto" : "px-3 py-2.5"
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}>
              Keluar
            </span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
