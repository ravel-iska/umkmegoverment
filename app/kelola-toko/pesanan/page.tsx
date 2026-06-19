import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { PesananClient } from "./pesanan-client";

export default async function PesananPage() {
  const session = await getSession();

  if (!session || (session.role !== "Penjual" && session.role !== "Admin")) {
    redirect("/login");
  }

  const ordersRaw = await db.order.findMany({
    where: { sellerId: session.id },
    include: {
      user: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const orders = ordersRaw.map((o) => ({
    id: o.id,
    buyerName: o.user.name,
    buyerEmail: o.user.email,
    buyerPhone: o.user.phone || "Tidak ada nomor telp",
    buyerAddress: o.user.address || "Tidak ada alamat",
    totalAmount: o.totalAmount,
    status: o.status,
    paymentMethod: o.paymentMethod || "COD",
    paymentProof: o.paymentProof || null,
    trackingNumber: o.trackingNumber || null,
    createdAt: o.createdAt.toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
    }),
    items: o.items.map((i) => ({
      productName: i.product.name,
      quantity: i.quantity,
      price: i.price,
    })),
  }));

  return <PesananClient initialOrders={orders} />;
}
