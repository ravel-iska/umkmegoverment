"use client";

import { useState } from "react";
import { ShieldCheck, XCircle, Eye, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { processVerification } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

type PendingUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  ktpProof: string | null;
  productProof: string | null;
  productDescription: string | null;
  verificationStatus: string;
  createdAt: Date;
};

export function VerifikasiClient({ initialData }: { initialData: PendingUser[] }) {
  const [users, setUsers] = useState<PendingUser[]>(initialData);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleAction = async (userId: string, action: "Approve" | "Reject") => {
    const confirmMsg = action === "Approve" 
      ? "Apakah Anda yakin ingin menyetujui UMKM ini?" 
      : "Apakah Anda yakin ingin MENOLAK UMKM ini?";
      
    if (!confirm(confirmMsg)) return;

    setIsProcessing(true);
    const toastId = toast.loading("Memproses...");

    try {
      const res = await processVerification(userId, action);
      if (res.error) throw new Error(res.error);

      toast.success(action === "Approve" ? "UMKM berhasil disetujui" : "UMKM ditolak", { id: toastId });
      setUsers(users.filter(u => u.id !== userId));
      setSelectedUser(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  if (users.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <Inbox className="h-12 w-12 mb-4 text-muted/50" />
          <p className="text-lg font-medium text-foreground">Tidak Ada Antrean</p>
          <p className="text-sm">Semua UMKM yang mendaftar sudah selesai ditinjau.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List UMKM */}
      <div className="col-span-1 lg:col-span-2 space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-stretch">
                <div className="p-4 sm:p-6 flex-1 min-w-0 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Menunggu Tinjauan
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(user.createdAt))}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg truncate mb-1">{user.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {user.email} • {user.phone || "Tidak ada nomor"}
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Lihat Dokumen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail / Modal Panel */}
      <div className="col-span-1">
        <div className="sticky top-24">
          {selectedUser ? (
            <Card className="border-primary shadow-sm border-2">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">Dokumen Verifikasi</h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedUser(null)}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* KTP */}
                  <div>
                    <p className="text-sm font-semibold mb-2 text-muted-foreground">1. Foto KTP / Identitas</p>
                    <div className="bg-muted rounded-xl aspect-video relative overflow-hidden border">
                      {selectedUser.ktpProof ? (
                        <Image src={selectedUser.ktpProof} alt="KTP" fill className="object-contain" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                          Tidak ada foto
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Produk */}
                  <div>
                    <p className="text-sm font-semibold mb-2 text-muted-foreground">2. Foto Sampel Produk</p>
                    <div className="bg-muted rounded-xl aspect-square relative overflow-hidden border">
                      {selectedUser.productProof ? (
                        <Image src={selectedUser.productProof} alt="Produk" fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                          Tidak ada foto
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedUser.productDescription && (
                    <div className="p-4 bg-muted/30 rounded-xl border">
                      <h4 className="font-semibold text-sm mb-2 text-emerald-800">Deskripsi Sampel Produk</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedUser.productDescription}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t flex flex-col gap-3">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={isProcessing}
                      onClick={() => handleAction(selectedUser.id, "Approve")}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" /> Terima & Aktifkan Toko
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      disabled={isProcessing}
                      onClick={() => handleAction(selectedUser.id, "Reject")}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Tolak Dokumen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-64">
                <Eye className="h-8 w-8 mb-4 text-muted/50" />
                <p className="text-sm">Pilih UMKM di sebelah kiri untuk meninjau dokumen verifikasinya.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
