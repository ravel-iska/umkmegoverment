"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UploadCloud, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function PengaturanClient({ user }: { user: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  
  const [avatar, setAvatar] = useState<string>(user.avatar || "");
  
  let initialCovers: string[] = [];
  try {
    if (user.coverImages) {
      const parsed = JSON.parse(user.coverImages);
      if (Array.isArray(parsed)) {
        initialCovers = parsed;
      } else if (typeof parsed === "string") {
        initialCovers = JSON.parse(parsed); // Handle double stringify just in case
      }
    }
  } catch (e) {}
  
  const [covers, setCovers] = useState<string[]>(initialCovers);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Mengunggah foto profil...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setAvatar(data.url);
      toast.success("Foto profil berhasil diunggah", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Gagal mengunggah gambar", { id: toastId });
    } finally {
      e.target.value = "";
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (covers.length + files.length > 5) {
      toast.error("Maksimal 5 foto sampul diperbolehkan");
      return;
    }

    const toastId = toast.loading("Mengunggah foto sampul...");
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        }
      }
      
      if (uploadedUrls.length > 0) {
        setCovers(prev => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} foto sampul berhasil diunggah`, { id: toastId });
      } else {
        toast.error("Gagal mengunggah foto", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan", { id: toastId });
    } finally {
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          avatar,
          coverImages: JSON.stringify(covers),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Pengaturan toko berhasil disimpan!");
      router.refresh(); // Refresh halaman agar data terbaru terambil
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 bg-card border rounded-xl p-6 sm:p-8">
      
      <div className="space-y-6">
        <h3 className="text-lg font-bold border-b pb-2">Informasi Toko</h3>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Nama Toko</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Nomor WhatsApp</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08123456789" required />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Alamat Lengkap Toko</Label>
          <Textarea 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="Jl. Raya Podosari No. 123..." 
            rows={3}
            required
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold border-b pb-2">Visual Toko</h3>

        {/* Avatar Upload */}
        <div className="space-y-3">
          <Label>Foto Profil Toko</Label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border bg-muted overflow-hidden relative shrink-0">
              {avatar ? (
                <Image src={avatar} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Disarankan ukuran 1:1 (Persegi). Maksimal 2MB.</p>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <Button type="button" variant="outline" onClick={() => document.getElementById("avatar-upload")?.click()}>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Unggah Profil
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Images Upload */}
        <div className="space-y-3 pt-4">
          <div className="flex justify-between items-center">
            <Label>Foto Sampul Toko (Maksimal 5)</Label>
            <span className="text-sm text-muted-foreground">{covers.length} / 5</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Foto sampul akan ditampilkan sebagai *slider* animasi di profil toko Anda. Disarankan rasio 16:9 atau 3:1 (Mendatar).
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {covers.map((url, idx) => (
              <div key={idx} className="relative aspect-video rounded-lg border bg-muted overflow-hidden group">
                <Image src={url} alt={`Cover ${idx}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setCovers(covers.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {covers.length < 5 && (
              <label className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Tambah Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto min-w-[150px]">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Simpan Pengaturan
        </Button>
      </div>

    </form>
  );
}
