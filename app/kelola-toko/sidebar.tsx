"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ListOrdered,
  LogOut,
  Menu,
  Store,
  BarChart2,
  Settings,
  MessageCircle
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function SellerSidebar({ userName, role }: { userName: string; role: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Dashboard", href: "/kelola-toko", icon: LayoutDashboard },
    { name: "Pesan Masuk", href: "/kelola-toko/chat", icon: MessageCircle },
    { name: "Produk Saya", href: "/kelola-toko/produk", icon: Package },
    { name: "Pesanan", href: "/kelola-toko/pesanan", icon: ListOrdered },
    { name: "Laporan", href: "/kelola-toko/laporan", icon: BarChart2 },
    { name: "Pengaturan Toko", href: "/kelola-toko/pengaturan", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden bg-background"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-card border-r shadow-sm transition-all duration-300 flex flex-col overflow-x-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Header */}
        <div className={`h-16 flex items-center border-b transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between px-6 shrink-0"}`}>
          <Link
            href="/kelola-toko"
            className={`font-bold text-xl text-emerald-600 flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
          >
            <Store className="h-5 w-5 shrink-0" />
            Toko Saya
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={`hidden md:flex text-muted-foreground hover:bg-muted shrink-0 ${isCollapsed ? "w-10 h-10" : ""}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Perluas" : "Perkecil"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className={`border-b overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "h-0 p-0 opacity-0 border-transparent" : "h-[72px] p-6 pb-2 opacity-100"}`}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Penjual
          </p>
          <p className="text-sm font-medium truncate">{userName}</p>
          {role === "Admin" && (
            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
              Admin Mode
            </span>
          )}
        </div>

        {/* Nav */}
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
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${isCollapsed ? "w-10 h-10 justify-center mx-auto" : "px-3 py-2.5"}`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-emerald-600" : ""}`} />
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t pb-8">
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

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
