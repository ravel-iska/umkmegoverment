"use client";

import { useState } from "react";
import { ListOrdered } from "lucide-react";

interface OrderRecord {
  id: string;
  buyerName: string;
  sellerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  paymentProof?: string | null;
  items: { productName: string; quantity: number }[];
}

export function OrderClient({ initialOrders }: { initialOrders: OrderRecord[] }) {
  const [orderFilter, setOrderFilter] = useState<string>("Semua");

  const filteredOrders = orderFilter === "Semua" ? initialOrders : initialOrders.filter((o) => o.status === orderFilter);

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold flex items-center gap-2">
          <ListOrdered className="h-5 w-5" /> Daftar Transaksi
        </h2>
        <div className="flex gap-2 flex-wrap">
          {(["Semua", "Pending", "Diproses", "Dikirim", "Selesai"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setOrderFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                orderFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {["Tanggal", "Pembeli", "Penjual", "Rincian Barang", "Total", "Pembayaran", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map((o) => (
              <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{o.createdAt}</td>
                <td className="px-4 py-3 font-medium">{o.buyerName}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.sellerName}</td>
                <td className="px-4 py-3">
                  <ul className="text-xs space-y-1">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        {i.quantity}x {i.productName}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3 font-medium text-emerald-600">Rp {o.totalAmount.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{o.paymentMethod || "COD"}</span>
                    {o.paymentMethod === "TRANSFER" && o.paymentProof && (
                      <a href={o.paymentProof} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline">
                        Lihat Bukti
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    o.status === "Pending" ? "bg-amber-100 text-amber-700" :
                    o.status === "Diproses" ? "bg-indigo-100 text-indigo-700" :
                    o.status === "Dikirim" ? "bg-purple-100 text-purple-700" :
                    o.status === "Dibatalkan" ? "bg-red-100 text-red-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada pesanan masuk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
