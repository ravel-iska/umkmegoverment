import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { BarChart2, TrendingUp, Package, DollarSign, ShoppingBag, Star, ListOrdered } from "lucide-react";

export default async function LaporanPage() {
  const session = await getSession();

  if (!session || (session.role !== "Penjual" && session.role !== "Admin")) {
    redirect("/login");
  }

  const userWithProducts = await db.user.findUnique({
    where: { id: session.id },
    include: {
      products: { include: { category: true } },
    },
  });

  const products = userWithProducts?.products || [];

  const ordersRaw = await db.order.findMany({
    where: { sellerId: session.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Hitung stats
  const totalPendapatan = products.reduce((s, p) => s + p.price * p.sold, 0);
  const totalTerjual = products.reduce((s, p) => s + p.sold, 0);
  const avgRating = products.length > 0
    ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1)
    : "0.0";

  // Top 5 produk terlaris
  const topProducts = [...products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // Pendapatan per bulan (6 bulan terakhir)
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    const total = ordersRaw
      .filter((o) => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      })
      .reduce((s, o) => s + o.totalAmount, 0);
    return { label, total };
  });

  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  // Order status breakdown
  const statusCount = ordersRaw.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Produk habis/menipis
  const lowStock = products.filter((p) => p.stock < 5);

  return (
    <div className="max-w-6xl mx-auto py-6 px-2">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-emerald-600" /> Laporan Toko
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Ringkasan performa toko Anda</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Pendapatan", value: `Rp ${totalPendapatan.toLocaleString("id-ID")}`, icon: DollarSign, color: "bg-emerald-50 text-emerald-700" },
          { label: "Total Terjual", value: `${totalTerjual} item`, icon: TrendingUp, color: "bg-blue-50 text-blue-700" },
          { label: "Jumlah Produk", value: `${products.length} produk`, icon: ShoppingBag, color: "bg-purple-50 text-purple-700" },
          { label: "Rata-rata Rating", value: `${avgRating} ⭐`, icon: Star, color: "bg-amber-50 text-amber-700" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Bar Chart Pendapatan Bulanan */}
        <div className="md:col-span-2 bg-card rounded-xl border p-6">
          <h2 className="font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Pendapatan 6 Bulan Terakhir
          </h2>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((m) => {
              const heightPct = maxMonthly > 0 ? (m.total / maxMonthly) * 100 : 0;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                  <p className="text-[10px] font-medium text-muted-foreground rotate-[-20deg] origin-center">
                    {m.total > 0 ? `Rp ${(m.total / 1000).toFixed(0)}k` : "-"}
                  </p>
                  <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-700 ${m.total > 0 ? "bg-emerald-500" : "bg-muted"}`}
                      style={{ height: `${Math.max(heightPct, m.total > 0 ? 4 : 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">{m.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Pesanan */}
        <div className="bg-card rounded-xl border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
            Status Pesanan
          </h2>
          {Object.keys(statusCount).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada pesanan.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(statusCount).map(([status, count]) => {
                const total = ordersRaw.length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const color =
                  status === "Pending" ? "bg-amber-400" :
                  status === "Diproses" ? "bg-blue-400" :
                  status === "Dikirim" ? "bg-purple-400" :
                  "bg-emerald-400";
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{status}</span>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Produk Terlaris */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" /> Top 5 Produk Terlaris
            </h2>
          </div>
          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Belum ada data penjualan.</div>
          ) : (
            <div className="divide-y">
              {topProducts.map((p, idx) => (
                <div key={p.id} className="px-6 py-3 flex items-center gap-4">
                  <span className={`text-sm font-bold w-5 shrink-0 ${idx === 0 ? "text-amber-500" : idx === 1 ? "text-gray-400" : idx === 2 ? "text-amber-700" : "text-muted-foreground"}`}>
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-emerald-600">{p.sold} terjual</p>
                    <p className="text-xs text-muted-foreground">Rp {(p.price * p.sold).toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stok Menipis */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" /> Peringatan Stok
            </h2>
          </div>
          {lowStock.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <p className="text-2xl mb-2">✅</p>
              Semua stok dalam kondisi aman!
            </div>
          ) : (
            <div className="divide-y">
              {lowStock.map((p) => (
                <div key={p.id} className="px-6 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category.name}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {p.stock === 0 ? "Habis" : `${p.stock} sisa`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
