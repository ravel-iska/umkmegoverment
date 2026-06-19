import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RiwayatPage() {
  const session = await getSession("admin_session");
  
  if (!session || session.role !== "Admin") {
    redirect("/admin/login");
  }

  // Ambil semua pesanan yang sudah selesai atau dibatalkan
  const history = await db.order.findMany({
    where: {
      OR: [
        { status: "Batal" },
        { status: "Selesai" }
      ]
    },
    include: {
      seller: true,
      user: true,
      items: {
        include: { product: true }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const serialized = history.map(order => ({
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    buyerName: order.user.name,
    sellerName: order.seller?.name || "Penjual Tidak Dikenal",
    createdAt: order.createdAt.toISOString()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Riwayat Transaksi</h1>
        <p className="text-muted-foreground mt-1">
          Laporan seluruh transaksi yang telah selesai atau dibatalkan di platform.
        </p>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">ID Pesanan</th>
                <th className="px-6 py-4">Pembeli</th>
                <th className="px-6 py-4">Penjual</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {serialized.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              ) : (
                serialized.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{order.id.split('-')[0]}</td>
                    <td className="px-6 py-4 font-medium">{order.buyerName}</td>
                    <td className="px-6 py-4">{order.sellerName}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "Selesai" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
