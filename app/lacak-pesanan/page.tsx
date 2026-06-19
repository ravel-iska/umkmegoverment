"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { toast } from "sonner";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError("Silakan masukkan Nomor Resi atau Order ID.");
      return;
    }

    setIsLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/track?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Pesanan tidak ditemukan.");
      }
      
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mencari pesanan.");
    } finally {
      setIsLoading(false);
    }
  };

  const completeOrder = async (orderIdToComplete: string) => {
    if (!confirm("Apakah Anda yakin telah menerima barang dalam kondisi baik? Pesanan akan diselesaikan dan dana akan diteruskan ke penjual.")) return;

    try {
      const res = await fetch(`/api/track/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderIdToComplete })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyelesaikan pesanan");

      setOrder({ ...order, status: "Selesai" });
      toast.success("Pesanan berhasil diselesaikan! 🎉", {
        description: "Yuk beri ulasan & rating untuk membantu pembeli lain!",
        duration: 6000,
        action: {
          label: "Beri Ulasan",
          onClick: () => router.push("/profil"),
        },
      });

      // Redirect ke profil setelah 3 detik
      setTimeout(() => {
        router.push("/profil");
      }, 3000);
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <Clock className="h-6 w-6 text-amber-500" />;
      case "Diproses": return <Package className="h-6 w-6 text-blue-500" />;
      case "Dikirim": return <Truck className="h-6 w-6 text-purple-500" />;
      case "Selesai": return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
      default: return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Diproses": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Dikirim": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Selesai": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      
      <main className="flex-1 py-12 px-4 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-card rounded-2xl border shadow-sm p-6 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Lacak Pesanan</h1>
            <p className="text-muted-foreground">Masukkan nomor resi pengiriman atau nomor pesanan Anda.</p>
          </div>

          <form onSubmit={handleTrack} className="space-y-4 mb-8">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nomor Resi / Order ID</label>
                <Input 
                  placeholder="Contoh: JNE123456789 atau ID Pesanan" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                ⚠️ {error}
              </div>
            )}

            <Button type="submit" className="w-full rounded-xl h-11" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mencari...</>
              ) : (
                <><Search className="mr-2 h-4 w-4" /> Lacak Sekarang</>
              )}
            </Button>
          </form>

          {order && (
            <div className="border rounded-xl p-6 bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Status Pesanan</p>
                  <div className="flex items-center gap-3 mt-1">
                    {getStatusIcon(order.status)}
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Tanggal Order</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Rincian Produk</h3>
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.quantity}x {item.product.name}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                  <span>Total Tagihan</span>
                  <span className="text-emerald-600">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>


              {order.status === "Dikirim" && (
                <div className="mt-6 pt-6 border-t text-center">
                  <p className="text-sm text-muted-foreground mb-3">Apakah paket sudah Anda terima dengan baik?</p>
                  <Button 
                    onClick={() => completeOrder(order.id)}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Ya, Pesanan Diterima (Selesai)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
