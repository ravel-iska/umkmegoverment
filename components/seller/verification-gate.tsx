"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface VerificationGateProps {
  user: {
    id: string;
    verificationStatus: string;
  };
  children: React.ReactNode;
}

export function VerificationGate({ user, children }: VerificationGateProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [ktpUrl, setKtpUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");

  if (user.verificationStatus === "Verified") {
    return <>{children}</>;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "ktp" | "product") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading(`Mengunggah foto ${type === "ktp" ? "KTP" : "Produk"}...`);
    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal mengunggah gambar");
      const data = await res.json();
      
      if (type === "ktp") setKtpUrl(data.url);
      else setProductUrl(data.url);

      toast.success("Berhasil mengunggah gambar", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunggah gambar", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!ktpUrl || !productUrl || !productDescription) {
      toast.error("Harap lengkapi Foto KTP, Foto Sampel Produk, dan Deskripsi Produk");
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch("/api/users/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ktpProof: ktpUrl,
          productProof: productUrl,
          productDescription: productDescription,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengirim data verifikasi");
      
      toast.success("Data berhasil dikirim untuk ditinjau Admin");
      router.refresh(); // Refresh the layout to get new verificationStatus
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsUploading(false);
    }
  };

  if (user.verificationStatus === "Pending") {
    return (
      <div className="max-w-xl mx-auto mt-10 p-8 bg-card border rounded-2xl shadow-sm text-center">
        <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sedang Ditinjau Admin</h2>
        <p className="text-muted-foreground">
          Terima kasih telah mengunggah data verifikasi. Admin kami sedang memeriksa KTP dan sampel produk Anda. 
          Anda baru bisa mengakses dashboard setelah disetujui.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-card border rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Verifikasi Data UMKM</h2>
          <p className="text-muted-foreground text-sm">
            Sebagai langkah keamanan, kami mewajibkan penjual baru untuk mengunggah bukti identitas diri dan foto sampel produk asli.
          </p>
        </div>

        {user.verificationStatus === "Rejected" && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-start gap-3 mb-6 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Verifikasi Ditolak</p>
              <p>Admin menolak dokumen Anda sebelumnya. Silakan unggah ulang foto yang lebih jelas dan valid.</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Upload KTP */}
          <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-muted/50 transition-colors relative">
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleFileUpload(e, "ktp")}
              disabled={isUploading}
            />
            {ktpUrl ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span className="font-medium text-emerald-600">Foto KTP Terunggah</span>
                <span className="text-xs text-muted-foreground">Klik untuk mengganti</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="w-8 h-8 mb-1" />
                <span className="font-medium text-foreground">Unggah Foto KTP Asli</span>
                <span className="text-xs">Maksimal 2MB (JPG/PNG)</span>
              </div>
            )}
          </div>

          {/* Upload Product Sample */}
          <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-muted/50 transition-colors relative">
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleFileUpload(e, "product")}
              disabled={isUploading}
            />
            {productUrl ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span className="font-medium text-emerald-600">Foto Produk Terunggah</span>
                <span className="text-xs text-muted-foreground">Klik untuk mengganti</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="w-8 h-8 mb-1" />
                <span className="font-medium text-foreground">Unggah Foto Sampel Produk</span>
                <span className="text-xs">Maksimal 2MB (JPG/PNG). Harus foto asli jualan Anda.</span>
              </div>
            )}
          </div>

          {/* Product Description */}
          <div className="space-y-2 text-left">
            <label className="text-sm font-semibold text-foreground">Deskripsi Sampel Produk</label>
            <textarea 
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Ceritakan detail produk ini (misal: bahan baku, cara pembuatan, atau keunggulannya) agar Admin dapat menilainya dengan baik..."
              className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
              disabled={isUploading}
            />
          </div>

          <Button 
            className="w-full rounded-xl h-12 font-bold" 
            onClick={handleSubmit}
            disabled={isUploading || !ktpUrl || !productUrl || !productDescription}
          >
            {isUploading ? "Memproses..." : "Kirim Pengajuan Verifikasi"}
          </Button>
        </div>
      </div>
    </div>
  );
}

