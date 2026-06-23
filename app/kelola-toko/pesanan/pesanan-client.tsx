"use client";

import { useState } from "react";
import { ListOrdered, Package, Search, Filter, CheckCircle2, AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { updateOrderStatus } from "../actions";

interface OrderItem { productName: string; quantity: number; price: number; }
interface Order {
  id: string; buyerName: string; buyerEmail: string;
  buyerPhone: string; buyerAddress: string;
  totalAmount: number; status: string; createdAt: string; 
  paymentMethod: string; paymentProof?: string | null;
  trackingNumber?: string | null;
  items: OrderItem[];
}

const STATUS_FLOW = ["Pending", "Diproses", "Dikirim", "Selesai"];
const STATUS_STYLE: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Diproses: "bg-blue-100 text-blue-700 border-blue-200",
  Dikirim: "bg-purple-100 text-purple-700 border-purple-200",
  Diterima: "bg-teal-100 text-teal-700 border-teal-200",
  Selesai: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export function PesananClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isPending, setIsPending] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus ? o.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsPending(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Status diubah ke "${newStatus}"`);
    } catch {
      showToast("Gagal mengubah status.", "error");
    } finally {
      setIsPending(null);
    }
  };

  const counts = STATUS_FLOW.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto py-6 px-2">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ListOrdered className="h-6 w-6 text-emerald-600" /> Kelola Pesanan
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{orders.length} total pesanan</p>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATUS_FLOW.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
            className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
              filterStatus === s ? "ring-2 ring-emerald-500 border-emerald-300" : ""
            }`}
          >
            <p className="text-2xl font-bold">{counts[s] || 0}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{s}</p>
            {s === "Pending" && (counts[s] || 0) > 0 && (
              <span className="text-[10px] text-amber-600 font-medium">⚠ Perlu Tindakan</span>
            )}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pembeli atau produk..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            {STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="bg-card rounded-xl border flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-30" />
            <p className="font-medium">Tidak ada pesanan</p>
            <p className="text-xs mt-1">Belum ada pesanan yang sesuai filter.</p>
          </div>
        ) : (
          filtered.map((o) => (
            <div key={o.id} className="bg-card rounded-xl border p-5 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLE[o.status] || "bg-gray-100 text-gray-600"}`}>
                      {o.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{o.createdAt}</span>
                  </div>
                  <p className="font-bold text-foreground text-sm sm:text-base">{o.buyerName}</p>
                  <p className="text-xs text-muted-foreground">{o.buyerEmail}</p>
                  <div className="mt-1 text-xs text-muted-foreground space-y-0.5 mb-3">
                    <p><span className="font-semibold text-foreground">Telp:</span> {o.buyerPhone}</p>
                    <p><span className="font-semibold text-foreground">Alamat:</span> {o.buyerAddress}</p>
                    <p>
                      <span className="font-semibold text-foreground">ID Pesanan:</span>{" "}
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{o.id.split('-')[0]}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {o.items.map((item, idx) => (
                      <span key={idx} className="text-xs bg-muted px-2 py-1 rounded-lg">
                        {item.quantity}× {item.productName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: total + action */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <p className="text-lg font-bold text-emerald-600">
                    Rp {o.totalAmount.toLocaleString("id-ID")}
                  </p>

                  {o.buyerPhone && (
                    <a
                      href={`https://wa.me/${o.buyerPhone.startsWith("0") ? "62" + o.buyerPhone.slice(1) : o.buyerPhone}?text=${encodeURIComponent(`Halo ${o.buyerName}, ini dari toko ${o.items[0]?.productName ? 'penjual ' + o.items[0].productName : 'Pasar Podosari'}. Saya ingin menginformasikan tentang pesanan Anda dengan ID ${o.id.split('-')[0]}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full"
                    >
                      <button className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Hubungi Pembeli
                      </button>
                    </a>
                  )}



                  {o.status === "Pending" && (
                    <button
                      onClick={() => handleStatusChange(o.id, "Diproses")}
                      disabled={isPending === o.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      {isPending === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      Terima Pesanan
                    </button>
                  )}

                  {o.status !== "Pending" && o.status !== "Selesai" && o.status !== "Diterima" && (
                    <div className="flex items-center gap-2">
                      {isPending === o.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      <select
                        className="text-xs border rounded-lg px-2 py-1.5 bg-background cursor-pointer"
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        disabled={isPending === o.id}
                      >
                        {STATUS_FLOW.filter((s) => s !== "Pending").map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(o.status === "Selesai" || o.status === "Diterima") && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
