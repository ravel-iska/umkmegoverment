import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, ListOrdered, TrendingUp, DollarSign, ShoppingBag, Star, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function KelolaTokoPage() {
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
    orderBy: { createdAt: "desc" },
  });

  const totalPendapatan = products.reduce((s, p) => s + p.price * p.sold, 0);
  const totalTerjual = products.reduce((s, p) => s + p.sold, 0);
  const pendingOrders = ordersRaw.filter((o) => o.status === "Pending").length;
  const avgRating = products.length > 0
    ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1)
    : "0.0";

  const recentOrders = ordersRaw.slice(0, 5);
  const lowStockProducts = products.filter((p) => p.stock < 5);

  return (
    <div className="max-w-6xl mx-auto py-6 px-2">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Toko</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selamat datang kembali, <span className="font-semibold text-foreground">{session.name}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Produk",
            value: products.length,
            icon: ShoppingBag,
            color: "text-blue-600 bg-blue-50",
            sub: "produk aktif",
          },
          {
            label: "Total Terjual",
            value: totalTerjual,
            icon: TrendingUp,
            color: "text-emerald-600 bg-emerald-50",
            sub: "item terjual",
          },
          {
            label: "Pesanan Menunggu",
            value: pendingOrders,
            icon: ListOrdered,
            color: pendingOrders > 0 ? "text-amber-600 bg-amber-50" : "text-gray-500 bg-gray-100",
            sub: "perlu diproses",
          },
          {
            label: "Pendapatan",
            value: `Rp ${totalPendapatan.toLocaleString("id-ID")}`,
            icon: DollarSign,
            color: "text-emerald-700 bg-emerald-50",
            sub: "total pendapatan",
          },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-card rounded-xl border p-5 flex flex-col gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="md:col-span-2 bg-card rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-muted-foreground" />
              Pesanan Terbaru
            </h2>
            <Link href="/kelola-toko/pesanan" className="text-xs text-emerald-600 hover:underline font-medium">
              Lihat Semua →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Belum ada pesanan masuk.</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentOrders.map((o) => (
                <div key={o.id} className="px-6 py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {o.items.map((i) => i.product.name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.createdAt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-emerald-600">
                      Rp {o.totalAmount.toLocaleString("id-ID")}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      o.status === "Pending" ? "bg-amber-100 text-amber-700" :
                      o.status === "Diproses" ? "bg-blue-100 text-blue-700" :
                      o.status === "Dikirim" ? "bg-purple-100 text-purple-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + Low Stock */}
        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="bg-card rounded-xl border p-5">
            <h2 className="font-semibold mb-4 text-sm">Aksi Cepat</h2>
            <div className="flex flex-col gap-2">
              <Link
                href="/kelola-toko/produk"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-medium"
              >
                <Package className="h-4 w-4" /> Tambah Produk Baru
              </Link>
              <Link
                href="/kelola-toko/pesanan"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-sm font-medium"
              >
                <ListOrdered className="h-4 w-4" />
                Kelola Pesanan
                {pendingOrders > 0 && (
                  <span className="ml-auto bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {pendingOrders}
                  </span>
                )}
              </Link>
              <Link
                href="/kelola-toko/laporan"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <TrendingUp className="h-4 w-4" /> Lihat Laporan
              </Link>
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <div className="bg-card rounded-xl border p-5 border-amber-200 bg-amber-50/50">
              <h2 className="font-semibold mb-3 text-sm flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-4 w-4" /> Stok Menipis
              </h2>
              <div className="flex flex-col gap-2">
                {lowStockProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <p className="truncate text-foreground max-w-[130px]">{p.name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {p.stock === 0 ? "Habis" : `${p.stock} sisa`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
