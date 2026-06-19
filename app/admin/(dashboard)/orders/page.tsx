import { db } from "@/lib/db";
import { OrderClient } from "./order-client";

export default async function OrdersPage() {
  const ordersRaw = await db.order.findMany({
    include: { 
      user: { select: { name: true } }, 
      seller: { select: { name: true } },
      items: { include: { product: { select: { name: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });

  const orders = ordersRaw.map((o) => ({
    id: o.id,
    buyerName: o.user.name,
    sellerName: o.seller?.name || "Toko Tidak Diketahui",
    totalAmount: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt.toISOString().split("T")[0],
    items: o.items.map((i) => ({
      productName: i.product.name,
      quantity: i.quantity,
    }))
  }));

  return <OrderClient initialOrders={orders} />;
}
