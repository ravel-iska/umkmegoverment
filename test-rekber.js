const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // 1. Ambil produk pertama
  const product = await p.product.findFirst({ include: { seller: true } });
  if (!product) { console.log("❌ Tidak ada produk."); return; }
  console.log("✅ Produk ditemukan:", product.name, "| Seller:", product.seller?.name);

  // 2. Ambil user pembeli pertama (untuk guest checkout simulation)
  let buyer = await p.user.findFirst({ where: { role: 'Pembeli' } });
  if (!buyer) { console.log("❌ Tidak ada pembeli."); return; }
  console.log("✅ Pembeli:", buyer.name, "| Phone:", buyer.phone);

  // 3. Buat order TRANSFER (simulasi checkout rekber)
  const order = await p.order.create({
    data: {
      userId: buyer.id,
      sellerId: product.sellerId,
      totalAmount: product.price,
      paymentMethod: "TRANSFER",
      status: "Menunggu Verifikasi",
      items: {
        create: [{
          productId: product.id,
          quantity: 1,
          price: product.price,
        }]
      }
    },
    include: {
      items: { include: { product: true } },
      user: true,
      seller: true,
    }
  });
  console.log("✅ Order dibuat:", order.id, "| Status:", order.status);

  // 4. Verifikasi Admin: ubah status menjadi Diproses
  const updated = await p.order.update({
    where: { id: order.id },
    data: { status: "Diproses" },
  });
  console.log("✅ Admin Verifikasi — Status sekarang:", updated.status);

  // 5. Test API Track pesanan
  console.log("\n--- Uji API /api/track ---");
  // Test dengan phone yang benar
  const trackUrl = `http://localhost:3000/api/track?orderId=${order.id}&phone=${buyer.phone}`;
  console.log("🔗 URL:", trackUrl);

  try {
    const res = await fetch(trackUrl);
    const data = await res.json();
    if (res.ok) {
      console.log("✅ Lacak berhasil! Status:", data.order.status, "| Total:", data.order.totalAmount);
    } else {
      console.log("❌ Error:", data.error);
    }
  } catch (e) {
    console.log("❌ Fetch error:", e.message);
  }

  // Test dengan phone yang salah (security)
  try {
    const res2 = await fetch(`http://localhost:3000/api/track?orderId=${order.id}&phone=00000000`);
    const data2 = await res2.json();
    console.log("✅ Security test (wrong phone) — Status:", res2.status, "| Error:", data2.error);
  } catch(e) {
    console.log("❌ Security test error:", e.message);
  }

  // 6. Cleanup - hapus test order
  await p.orderItem.deleteMany({ where: { orderId: order.id } });
  await p.order.delete({ where: { id: order.id } });
  console.log("\n✅ Test order cleaned up. Semua tes selesai!");
}

main().catch(console.error).finally(() => p.$disconnect());
