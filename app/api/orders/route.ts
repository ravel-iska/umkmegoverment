import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { sendNewOrderToSellerWhatsapp } from "@/lib/fonnte";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Silakan login terlebih dahulu." }, { status: 401 });
    }

    const body = await request.json();
    const { items, shippingAddress, phone, notes, buyerName, email, paymentMethod, paymentProof } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Keranjang belanja kosong." }, { status: 400 });
    }

    if (!shippingAddress || !phone) {
      return NextResponse.json({ error: "Alamat pengiriman dan nomor telepon wajib diisi." }, { status: 400 });
    }

    const userId = session.id;

    // Ambil status pengguna terlebih dahulu
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { isBlocked: true }
    });

    if (currentUser?.isBlocked) {
      return NextResponse.json({ error: "Akun Anda telah diblokir. Anda tidak dapat melakukan transaksi." }, { status: 403 });
    }

    // Update address & phone of the logged in user
    await db.user.update({
      where: { id: userId },
      data: {
        address: shippingAddress,
        phone: phone
      }
    });

    // 1. Fetch all products to verify stock and price
    const productIds = items.map(item => item.productId);
    const products = await db.product.findMany({
      where: {
        id: { in: productIds }
      },
      include: {
        seller: true
      }
    });

    const productsMap = new Map(products.map(p => [p.id, p]));

    // Check stock for all items first
    for (const item of items) {
      const product = productsMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Produk tidak ditemukan.` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stok produk "${product.name}" tidak mencukupi (Tersisa: ${product.stock}).` }, { status: 400 });
      }
    }

    // 2. Group items by seller so we split the order for each seller
    const sellerGroups = new Map<string, { productId: string; quantity: number; price: number }[]>();

    for (const item of items) {
      const product = productsMap.get(item.productId);
      if (!product) continue;
      
      const sellerId = product.sellerId || "admin";
      if (!sellerGroups.has(sellerId)) {
        sellerGroups.set(sellerId, []);
      }
      sellerGroups.get(sellerId)!.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      });
    }

    const createdOrders: any[] = [];

    // 3. Create orders in a database transaction
    await db.$transaction(async (tx) => {
      for (const [sellerId, orderItemsList] of sellerGroups.entries()) {
        const totalAmount = orderItemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create the Order
        const order = await tx.order.create({
          data: {
            userId: userId,
            sellerId: sellerId === "admin" ? null : sellerId,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod || "COD",
            paymentProof: paymentMethod === "TRANSFER" ? paymentProof : null,
            status: paymentMethod === "TRANSFER" ? "Menunggu Verifikasi" : "Pending",
            items: {
              create: orderItemsList.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          }
        });

        // Update product stock and sold count
        for (const item of orderItemsList) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              sold: { increment: item.quantity }
            }
          });
        }

        // Find the seller phone for whatsapp
        let sellerPhone = "";
        let sellerName = "";
        const sampleProduct = productsMap.get(orderItemsList[0].productId);
        if (sampleProduct && sampleProduct.seller) {
          sellerPhone = sampleProduct.seller.phone || "";
          sellerName = sampleProduct.seller.name || "";
        }

        createdOrders.push({
          orderId: order.id,
          sellerName,
          sellerPhone,
          items: orderItemsList.map(i => ({
             name: productsMap.get(i.productId)?.name || "Produk",
             quantity: i.quantity,
             price: i.price
          })),
          totalAmount,
        });
      }
    });

    // 4. Send WhatsApp notifications asynchronously
    const appUrl = request.headers.get("origin") || "http://localhost:3000";
    Promise.all(createdOrders.map(order => sendNewOrderToSellerWhatsapp(order.orderId, appUrl)))
      .catch(err => console.error("Failed to send WA notifs:", err));

    return NextResponse.json({
      success: true,
      message: "Checkout berhasil diproses.",
      ordersCount: createdOrders.length,
      paymentMethod,
      orders: createdOrders
    });

  } catch (error: any) {
    console.error("Error during checkout:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat checkout." }, { status: 500 });
  }
}
