import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { User, Mail, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/lib/db";
import { OrderHistoryClient } from "./order-history-client";

export default async function ProfilPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      isBlocked: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: { select: { id: true, name: true, image: true } } }
          },
          seller: true,
          reviews: { select: { productId: true } }
        }
      }
    }
  });

  if (!user || user.isBlocked) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>

        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.role}</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Akun Terverifikasi
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Nomor WhatsApp</p>
                  <p className="text-sm font-semibold text-foreground truncate">{user.phone || "Belum diatur"}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {user.role === "Pembeli" && (
                <Link href="/lacak-pesanan" className="flex-1">
                  <Button className="w-full rounded-xl">Lacak Pesanan Saya</Button>
                </Link>
              )}
              {user.role === "Penjual" && (
                <Link href="/kelola-toko" className="flex-1">
                  <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">Masuk ke Dashboard Toko</Button>
                </Link>
              )}
              {user.role === "Admin" && (
                <Link href="/admin" className="flex-1">
                  <Button className="w-full rounded-xl bg-red-600 hover:bg-red-700">Masuk ke Dashboard Admin</Button>
                </Link>
              )}
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl">Kembali ke Beranda</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Riwayat Belanja (Khusus Pembeli) */}
        {user.orders.length > 0 && (
          <OrderHistoryClient orders={user.orders.map(order => ({
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            trackingNumber: order.trackingNumber,
            createdAt: order.createdAt.toISOString(),
            sellerName: order.seller?.name || "Pasar Podosari",
            sellerPhone: order.seller?.phone || "",
            reviewedProductIds: order.reviews.map(r => r.productId),
            items: order.items.map(item => ({
              productId: item.productId,
              productName: item.product.name,
              productImage: item.product.image,
              quantity: item.quantity,
              price: item.price
            }))
          }))} />
        )}
      </div>
    </div>
  );
}

