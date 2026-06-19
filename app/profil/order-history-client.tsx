"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ListFilter, Clock, Truck, CheckCircle2, XCircle, MessageCircle, Star, Loader2, Camera, X, ImagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string | null;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  trackingNumber?: string | null;
  createdAt: string;
  sellerName: string;
  sellerPhone: string;
  items: OrderItem[];
  reviewedProductIds?: string[];
}

export function OrderHistoryClient({ orders: initialOrders }: { orders: OrderData[] }) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [visibleCount, setVisibleCount] = useState(3);

  // Review state
  const [reviewOrder, setReviewOrder] = useState<OrderData | null>(null);
  const [reviewProduct, setReviewProduct] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [reviewedMap, setReviewedMap] = useState<Record<string, string[]>>(() => {
    // Initialize from orders prop
    const map: Record<string, string[]> = {};
    orders.forEach(o => { map[o.id] = o.reviewedProductIds || []; });
    return map;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ratingLabels = ["", "Buruk", "Kurang Baik", "Cukup", "Baik", "Sangat Baik"];

  const openReviewDialog = (order: OrderData, item: OrderItem) => {
    setReviewOrder(order);
    setReviewProduct(item);
    setRating(0);
    setHoverRating(0);
    setComment("");
    setReviewImages([]);
  };

  const closeReviewDialog = () => {
    setReviewOrder(null);
    setReviewProduct(null);
    setRating(0);
    setComment("");
    setReviewImages([]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (reviewImages.length + files.length > 5) {
      toast.error("Maksimal 5 foto per ulasan.");
      return;
    }

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} terlalu besar (maks 5MB)`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok && data.url) {
          setReviewImages(prev => [...prev, data.url]);
        } else {
          toast.error(`Gagal upload ${file.name}`);
        }
      }
    } catch {
      toast.error("Terjadi kesalahan saat upload foto.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder || !reviewProduct) return;
    if (rating === 0) {
      toast.error("Pilih rating bintang terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: reviewProduct.productId,
          orderId: reviewOrder.id,
          rating,
          comment,
          images: reviewImages,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim ulasan");

      toast.success("Ulasan berhasil dikirim! Terima kasih.");

      // Mark this product as reviewed locally
      setReviewedMap(prev => ({
        ...prev,
        [reviewOrder.id]: [...(prev[reviewOrder.id] || []), reviewProduct.productId]
      }));

      closeReviewDialog();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteOrder = async (orderIdToComplete: string) => {
    if (!confirm("Apakah Anda yakin telah menerima barang dalam kondisi baik? Pesanan akan diselesaikan dan dana akan diteruskan ke penjual.")) return;

    try {
      const res = await fetch(`/api/track/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderIdToComplete })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyelesaikan pesanan");

      toast.success("Pesanan berhasil diselesaikan! 🎉", {
        description: "Yuk beri ulasan & rating untuk membantu pembeli lain!",
        duration: 5000,
      });

      // Update state local agar langsung pindah ke tab Selesai
      setOrders(prev => prev.map(o => o.id === orderIdToComplete ? { ...o, status: "Selesai" } : o));
      setActiveFilter("Selesai");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    }
  };

  if (orders.length === 0) return null;

  const FILTER_TABS = [
    { key: "Semua", label: "Semua", icon: ListFilter },
    { key: "Menunggu", label: "Menunggu", icon: Clock },
    { key: "Dikirim", label: "Dikirim", icon: Truck },
    { key: "Selesai", label: "Selesai", icon: CheckCircle2 },
    { key: "Batal", label: "Batal", icon: XCircle },
  ];

  const filteredOrders = useMemo(() => {
    if (activeFilter === "Semua") return orders;
    if (activeFilter === "Menunggu") return orders.filter(o => o.status === "Pending" || o.status === "Diproses");
    return orders.filter(o => o.status === activeFilter);
  }, [orders, activeFilter]);

  const visibleOrders = filteredOrders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredOrders.length;

  const isProductReviewed = (orderId: string, productId: string) => {
    return (reviewedMap[orderId] || []).includes(productId);
  };

  return (
    <div className="mt-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-foreground">Riwayat Belanja Saya</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.key;
          let count = 0;
          if (tab.key === "Semua") count = orders.length;
          else if (tab.key === "Menunggu") count = orders.filter(o => o.status === "Pending" || o.status === "Diproses").length;
          else count = orders.filter(o => o.status === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => { setActiveFilter(tab.key); setVisibleCount(3); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                isActive 
                  ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-primary-foreground/20' : 'bg-muted-foreground/10'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {visibleOrders.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed">
            <p className="text-muted-foreground text-sm font-medium">Tidak ada pesanan untuk filter ini.</p>
          </div>
        ) : (
          visibleOrders.map((order) => (
            <div key={order.id} className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/20">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                    {order.id.split('-')[0]}
                  </p>
                  <p className="text-[11px] font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground mt-1">{order.sellerName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border text-muted-foreground">
                    {order.paymentMethod}
                  </span>
                  {order.trackingNumber && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      Resi: <span className="font-mono text-foreground font-semibold">{order.trackingNumber}</span>
                    </span>
                  )}
                </div>
              </div>
              <span className={`self-start sm:self-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                order.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                order.status === "Diproses" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                order.status === "Dikirim" ? "bg-purple-50 text-purple-700 border-purple-200" :
                order.status === "Selesai" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                "bg-red-50 text-red-700 border-red-200"
              }`}>
                {order.status}
              </span>
            </div>

            {/* Daftar produk dalam pesanan */}
            <div className="border-t border-b py-3 my-2 space-y-3">
              {order.items.map((item, idx) => {
                const reviewed = isProductReviewed(order.id, item.productId);
                return (
                  <div key={idx} className="flex items-center gap-3">
                    {/* Product thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-muted border overflow-hidden shrink-0 relative">
                      {item.productImage ? (
                        <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity}x Rp {item.price.toLocaleString("id-ID")}</p>
                    </div>
                    {/* Tombol ulasan per-produk (hanya jika Dikirim atau Selesai) */}
                    {(order.status === "Selesai" || order.status === "Dikirim") && (
                      reviewed ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Sudah Diulas
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          className="rounded-xl font-bold text-xs shrink-0"
                          onClick={() => openReviewDialog(order, item)}
                        >
                          <Star className="w-3.5 h-3.5 mr-1" />
                          Ulas
                        </Button>
                      )
                    )}
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-border my-4"></div>

            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[11px] text-muted-foreground">Total Belanja</span>
                <p className="text-base font-extrabold text-primary">Rp {order.totalAmount.toLocaleString("id-ID")}</p>
              </div>
              <div className="flex gap-2">
                {(order.status === "Pending" || order.status === "Diproses") && order.sellerPhone && (
                  <a
                    href={`https://wa.me/${order.sellerPhone.startsWith("0") ? "62" + order.sellerPhone.slice(1) : order.sellerPhone}?text=${encodeURIComponent(`Halo admin ${order.sellerName}, saya ingin menanyakan pesanan saya dengan ID ${order.id.split('-')[0]}. Apakah sudah bisa diproses?`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline" className="rounded-xl font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-all gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      Hubungi Penjual
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            className="rounded-xl text-sm w-full sm:w-auto"
            onClick={() => setVisibleCount((prev) => prev + 3)}
          >
            Tampilkan Lebih Banyak
          </Button>
        </div>
      )}

      {/* Review Dialog - Per Produk */}
      <Dialog open={!!reviewOrder && !!reviewProduct} onOpenChange={(open) => !open && closeReviewDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Beri Ulasan Produk</DialogTitle>
            <DialogDescription>
              Bagikan pengalaman Anda dengan produk ini agar pembeli lain terbantu!
            </DialogDescription>
          </DialogHeader>

          {reviewProduct && (
            <div className="space-y-5 py-2">
              {/* Product being reviewed */}
              <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border">
                <div className="w-14 h-14 rounded-lg bg-muted border overflow-hidden shrink-0 relative">
                  {reviewProduct.productImage ? (
                    <Image src={reviewProduct.productImage} alt={reviewProduct.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground truncate">{reviewProduct.productName}</p>
                  <p className="text-xs text-muted-foreground">{reviewProduct.quantity}x Rp {reviewProduct.price.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Berikan Rating</p>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star 
                        className={`h-9 w-9 transition-colors ${
                          star <= (hoverRating || rating) 
                            ? "fill-amber-400 text-amber-400" 
                            : "text-muted-foreground/30"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                {(hoverRating || rating) > 0 && (
                  <p className="text-xs font-bold text-primary animate-in fade-in duration-200">
                    {ratingLabels[hoverRating || rating]}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Komentar (opsional)</label>
                <Textarea 
                  placeholder="Ceritakan pengalaman Anda dengan produk ini..." 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="rounded-xl"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  Foto Produk (opsional, maks 5)
                </label>
                
                {/* Image previews */}
                {reviewImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {reviewImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border group">
                        <Image src={img} alt={`Preview ${i+1}`} fill className="object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {reviewImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary border border-dashed border-primary/40 rounded-xl hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImagePlus className="w-4 h-4" />
                    )}
                    {isUploading ? "Mengupload..." : "Tambah Foto"}
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeReviewDialog} className="rounded-xl">Batal</Button>
            <Button onClick={handleSubmitReview} disabled={isSubmitting || rating === 0} className="rounded-xl">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Ulasan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
