"use client";

import { useState } from "react";
import { Users, UserCheck, UserX, Ban, BadgeCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { UserRole } from "@/lib/auth";
import { toggleUserRole, deleteUser, toggleBlockUser, toggleVerifyUser } from "../actions";

interface UserRecord {
  id: string;
  email: string;
  nama: string;
  role: UserRole;
  bergabung: string;
  transaksi: number;
  isBlocked: boolean;
  isVerified: boolean;
}

const roleBadge: Record<string, string> = {
  Admin:   "bg-red-100 text-red-700",
  Penjual: "bg-emerald-100 text-emerald-700",
  Pembeli: "bg-blue-100 text-blue-700",
};

export function UserClient({ initialUsers }: { initialUsers: UserRecord[] }) {
  const [filter, setFilter] = useState<UserRole | "Semua">("Semua");
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [isPending, setIsPending] = useState(false);

  const handleToggleRole = async (id: string) => {
    setIsPending(true);
    try {
      const result = await toggleUserRole(id);
      if (result.success) {
        setUsers(users.map(u => u.id === id ? { ...u, role: result.newRole as UserRole } : u));
        toast.success("Role pengguna berhasil diubah");
      } else {
        toast.error(result.error || "Gagal mengubah role");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah role");
    } finally {
      setIsPending(false);
    }
  };

  const handleToggleBlock = async (id: string) => {
    setIsPending(true);
    try {
      const result = await toggleBlockUser(id);
      if (result.success) {
        setUsers(users.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u));
        toast.success("Status blokir berhasil diubah");
      } else {
        toast.error(result.error || "Gagal mengubah status blokir");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status blokir");
    } finally {
      setIsPending(false);
    }
  };

  const handleToggleVerify = async (id: string) => {
    setIsPending(true);
    try {
      const result = await toggleVerifyUser(id);
      if (result.success) {
        setUsers(users.map(u => u.id === id ? { ...u, isVerified: !u.isVerified } : u));
        toast.success("Status verifikasi berhasil diubah");
      } else {
        toast.error(result.error || "Gagal verifikasi UMKM");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal verifikasi UMKM");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus user ini beserta seluruh pesanan dan produknya? Tindakan ini tidak dapat dibatalkan!")) return;
    setIsPending(true);
    try {
      const result = await deleteUser(id);
      if (result.success) {
        setUsers(users.filter(u => u.id !== id));
        toast.success("Pengguna berhasil dihapus permanen");
      } else {
        toast.error(result.error || "Gagal menghapus pengguna");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus pengguna");
    } finally {
      setIsPending(false);
    }
  };

  const filteredUsers = filter === "Semua" ? users : users.filter((u) => u.role === filter);

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" /> Manajemen Pengguna
        </h2>
        <div className="flex gap-2 flex-wrap">
          {(["Semua", "Pembeli", "Penjual"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === r
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {["Nama", "Email", "Role", "Status", "Bergabung", "Aksi"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((u) => (
              <tr key={u.id} className={`hover:bg-muted/20 transition-colors ${u.isBlocked ? 'opacity-60 bg-red-50' : ''}`}>
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  {u.nama}
                  {u.role === "Penjual" && u.isVerified && <span title="Penjual Terverifikasi"><BadgeCheck className="w-4 h-4 text-emerald-600" /></span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[u.role ?? "Pembeli"]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.isBlocked ? (
                    <span className="text-xs text-red-600 font-medium">Diblokir</span>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium">Aktif</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.bergabung}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {u.role === "Penjual" && !u.isVerified && (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        className="h-8 w-8 hover:text-emerald-600"
                        title="Verifikasi UMKM"
                        onClick={() => handleToggleVerify(u.id)}
                      >
                        <BadgeCheck className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      className={`h-8 w-8 ${u.isBlocked ? 'text-red-600 hover:text-red-700' : 'hover:text-amber-600'}`}
                      title={u.isBlocked ? "Buka Blokir" : "Blokir User"}
                      onClick={() => handleToggleBlock(u.id)}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      className="h-8 w-8 hover:text-destructive"
                      title="Hapus User"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada pengguna.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
