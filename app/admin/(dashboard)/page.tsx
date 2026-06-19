import { db } from "@/lib/db";
import { ShieldCheck, Users, ShoppingBag, DollarSign, Store, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const [totalUser, totalTransaksi, totalPenjual, aggregate, recentUsers, recentOrders] = await Promise.all([
    db.user.count(),
    db.order.count(),
    db.user.count({ where: { role: "Penjual" } }),
    db.order.aggregate({ _sum: { totalAmount: true } }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    db.order.findMany({
      take: 5,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const pendapatan = aggregate._sum.totalAmount || 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground text-sm">
            Ringkasan statistik marketplace Pasar Podosari
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total User",        value: totalUser,         icon: Users,       color: "text-blue-600 bg-blue-50" },
          { label: "Total Transaksi",   value: totalTransaksi,    icon: ShoppingBag, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Penjual",     value: totalPenjual,      icon: Store,       color: "text-yellow-600 bg-yellow-50" },
          { label: "Total Omzet", value: `Rp ${(pendapatan).toLocaleString('id-ID')}`,  icon: DollarSign,  color: "text-primary bg-primary/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Pengguna Baru</h2>
            <Link href="/admin/users" className="text-sm text-primary hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4 flex-1">
            {recentUsers.length > 0 ? (
              recentUsers.map(user => (
                <div key={user.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user.role === 'Admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'Penjual' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Belum ada pengguna
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Transaksi Terakhir</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4 flex-1">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{order.user?.name || "Pembeli (Guest)"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-emerald-600">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Belum ada transaksi
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
