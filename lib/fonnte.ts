import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/lib/db";

// Helper to generate A4 PDF invoice in memory
export async function generateInvoicePdf(order: any): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { height } = page.getSize();
  
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  
  const drawText = (text: string, x: number, y: number, font = fontRegular, size = 10, color = rgb(0,0,0), align = "left", maxWidth = 240) => {
    let finalX = x;
    if (align === "right") {
      const textWidth = font.widthOfTextAtSize(text, size);
      finalX = x - textWidth;
    } else if (align === "center") {
      const textWidth = font.widthOfTextAtSize(text, size);
      finalX = x - (textWidth / 2);
    }
    
    // Simple text wrapping (very basic)
    const words = text.split(" ");
    let line = "";
    let lineY = y;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const testWidth = font.widthOfTextAtSize(testLine, size);
      if (testWidth > maxWidth && i > 0) {
        page.drawText(line, { x: finalX, y: height - lineY, font, size, color });
        line = words[i] + " ";
        lineY += size + 4;
      } else {
        line = testLine;
      }
    }
    page.drawText(line, { x: finalX, y: height - lineY, font, size, color });
    return lineY - y + size; // return height used
  };
  
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color = rgb(0.9, 0.9, 0.9), thickness = 1) => {
    page.drawLine({ start: { x: x1, y: height - y1 }, end: { x: x2, y: height - y2 }, thickness, color });
  };
  
  const drawRect = (x: number, y: number, w: number, h: number, color = rgb(0.95, 0.95, 0.96)) => {
    page.drawRectangle({ x, y: height - y - h, width: w, height: h, color, borderColor: color });
  };

  const cGreen = rgb(21/255, 128/255, 61/255);
  const cGray = rgb(107/255, 114/255, 128/255);
  const cDark = rgb(17/255, 24/255, 39/255);
  const cLightGray = rgb(229/255, 231/255, 235/255);

  const orderDate = new Date(order.createdAt).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const subtotal = order.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

  // Header Section
  drawText("Pasar Podosari", 50, 65, fontBold, 20, cGreen);
  drawText("Marketplace UMKM Lokal - Podosari, Pringsewu", 50, 80, fontRegular, 10, cGray);

  drawText("INVOICE PESANAN", 545, 65, fontBold, 12, cDark, "right");
  drawText(`#${order.id.slice(0, 8).toUpperCase()}`, 545, 85, fontBold, 16, cGreen, "right");

  drawLine(50, 105, 545, 105, cLightGray, 1);

  // Invoice Meta Details
  drawText("TANGGAL PESANAN", 50, 130, fontBold, 8, cGray);
  drawText(orderDate, 50, 145, fontRegular, 10, cDark);

  drawText("STATUS PESANAN", 220, 130, fontBold, 8, cGray);
  drawText(order.status.toUpperCase(), 220, 145, fontBold, 10, cGreen);

  drawText("METODE PEMBAYARAN", 380, 130, fontBold, 8, cGray);
  drawText(order.paymentMethod === "COD" ? "Bayar di Tempat (COD)" : "Transfer Bank", 380, 145, fontRegular, 10, cDark);

  drawLine(50, 165, 545, 165, cLightGray, 1);

  // Buyer details
  drawText("PEMBELI", 50, 190, fontBold, 8, cGray);
  drawText(order.user.name, 50, 205, fontBold, 11, cDark);
  drawText(`No. Telp: ${order.user.phone || "-"}`, 50, 220, fontRegular, 9, cGray);
  
  let buyerY = 220;
  if (order.user.email) {
    buyerY += 15;
    drawText(`Email: ${order.user.email}`, 50, buyerY, fontRegular, 9, cGray);
  }
  buyerY += 15;
  const addressHeight = drawText(`Alamat: ${order.user.address || "-"}`, 50, buyerY, fontRegular, 9, cGray, "left", 230);
  buyerY += addressHeight;

  // Seller details
  drawText("PENJUAL", 300, 190, fontBold, 8, cGray);
  drawText(order.seller?.name || "Penjual Pasar Podosari", 300, 205, fontBold, 11, cDark);
  drawText(`No. Telp: ${order.seller?.phone || "-"}`, 300, 220, fontRegular, 9, cGray);
  drawText("Pasar UMKM Podosari", 300, 235, fontRegular, 9, cGray);

  // Spacing to Items Table
  const tableTopY = Math.max(buyerY + 30, 280);

  // Table Header Background
  drawRect(50, tableTopY, 495, 20, rgb(243/255, 244/255, 246/255));

  // Table Headers text
  drawText("NAMA PRODUK", 60, tableTopY + 14, fontBold, 9, cGray);
  drawText("QTY", 325, tableTopY + 14, fontBold, 9, cGray, "center");
  drawText("HARGA", 440, tableTopY + 14, fontBold, 9, cGray, "right");
  drawText("SUBTOTAL", 535, tableTopY + 14, fontBold, 9, cGray, "right");

  let currentY = tableTopY + 35;

  // Loop through items
  order.items.forEach((item: any) => {
    const textHeight = drawText(item.product.name, 60, currentY, fontRegular, 9, cDark, "left", 240);
    drawText(item.quantity.toString(), 325, currentY, fontRegular, 9, cDark, "center");
    drawText(`Rp ${item.price.toLocaleString("id-ID")}`, 440, currentY, fontRegular, 9, cDark, "right");
    drawText(`Rp ${(item.price * item.quantity).toLocaleString("id-ID")}`, 535, currentY, fontRegular, 9, cDark, "right");

    currentY += textHeight + 10;
    drawLine(50, currentY - 8, 545, currentY - 8, cLightGray, 1);
  });

  currentY += 10;

  // Totals
  drawText("Subtotal", 440, currentY, fontRegular, 9, cGray, "right");
  drawText(`Rp ${subtotal.toLocaleString("id-ID")}`, 535, currentY, fontBold, 9, cDark, "right");

  currentY += 18;
  drawText("Ongkos Kirim", 440, currentY, fontRegular, 9, cGray, "right");
  drawText("Gratis", 535, currentY, fontBold, 9, cDark, "right");

  currentY += 22;
  drawLine(350, currentY - 12, 545, currentY - 12, cLightGray, 1.5);

  drawText("Total Tagihan", 440, currentY, fontBold, 12, cGreen, "right");
  drawText(`Rp ${order.totalAmount.toLocaleString("id-ID")}`, 535, currentY, fontBold, 12, cDark, "right");

  // Footer Section
  const footerY = Math.max(currentY + 60, 750);
  drawLine(50, footerY, 545, footerY, cLightGray, 1);

  drawText("Terima kasih telah berbelanja di Pasar Podosari!", 297, footerY + 20, fontRegular, 9, cGray, "center");
  drawText("Invoice ini dihasilkan secara otomatis dan sah tanpa tanda tangan.", 297, footerY + 35, fontRegular, 8, cDark, "center");
  drawText("support@pasarpodosari.id | pasarpodosari.id", 297, footerY + 50, fontRegular, 8, cGreen, "center");

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

// Function to send invoice link via Fonnte WA gateway
export async function sendInvoiceToWhatsapp(orderId: string, appUrl: string = "http://localhost:3000") {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, phone: true, address: true, email: true } },
        seller: { select: { name: true, phone: true } },
        items: {
          include: {
            product: { select: { name: true, slug: true } },
          },
        },
      },
    });

    if (!order) {
      console.error(`[Fonnte] Order not found: ${orderId}`);
      return { success: false, error: "Order not found" };
    }

    const buyerPhone = order.user.phone;
    if (!buyerPhone) {
      console.warn(`[Fonnte] Buyer phone is missing for order: ${orderId}`);
      return { success: false, error: "Buyer phone number is missing" };
    }

    // Normalize phone number (e.g. prefixing with 62)
    let targetPhone = buyerPhone.trim();
    if (targetPhone.startsWith("0")) {
      targetPhone = "62" + targetPhone.slice(1);
    } else if (!targetPhone.startsWith("62") && !targetPhone.startsWith("+")) {
      targetPhone = "62" + targetPhone;
    }
    targetPhone = targetPhone.replace(/[^0-9]/g, "");

    const token = process.env.FONNTE_TOKEN;
    if (!token) {
      console.warn("[Fonnte] FONNTE_TOKEN is not configured in .env file");
      return { success: false, error: "Fonnte token not configured" };
    }

    const orderCode = order.id.slice(0, 8).toUpperCase();
    const orderDate = new Date(order.createdAt).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const totalAmountStr = order.totalAmount.toLocaleString("id-ID");
    const paymentMethodStr = order.paymentMethod === "COD" ? "Bayar di Tempat (COD)" : "Transfer Bank";
    const invoiceUrl = `${appUrl}/invoice/${order.id}`;

    const reviewUrl = `${appUrl}/profil`;

    const messageText = `Halo *${order.user.name}*,\n\n` +
      `Terima kasih telah berbelanja di *Pasar Podosari*! 🛒\n\n` +
      `Pesanan Anda dengan kode *#${orderCode}* telah *${order.status === "Selesai" ? "selesai" : "dikirim oleh penjual"}*.\n\n` +
      `*Detail Pesanan:*\n` +
      `- Tanggal: ${orderDate}\n` +
      `- Metode Pembayaran: ${paymentMethodStr}\n` +
      `- Total Tagihan: Rp ${totalAmountStr}\n\n` +
      `📄 *Invoice Pesanan:*\n` +
      `${invoiceUrl}\n\n` +
      `⭐ *Beri Ulasan & Rating:*\n` +
      `Bantu penjual dan pembeli lain dengan memberi ulasan di halaman Profil > Riwayat Belanja:\n` +
      `${reviewUrl}\n\n` +
      `Semoga produknya bermanfaat! 😊`;

    console.log(`[Fonnte] Sending WA invoice text to ${targetPhone}...`);
    const formData = new FormData();
    formData.append("target", targetPhone);
    formData.append("message", messageText);

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const result = await response.json();
    console.log("[Fonnte] API response:", result);
    return { success: true, response: result };
  } catch (error: any) {
    console.error("[Fonnte] Error sending invoice:", error);
    return { success: false, error: error?.message || error };
  }
}

// Function to send notification when Admin verifies payment
export async function sendRekberVerifiedNotification(orderId: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, phone: true, address: true } },
        seller: { select: { name: true, phone: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order) return { success: false, error: "Order not found" };

    const token = process.env.FONNTE_TOKEN;
    if (!token) return { success: false, error: "Fonnte token not configured" };

    const formatPhone = (p: string | null) => {
      if (!p) return null;
      let cleaned = p.trim().replace(/[^0-9]/g, "");
      if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
      if (!cleaned.startsWith("62")) return "62" + cleaned;
      return cleaned;
    };

    const buyerPhone = formatPhone(order.user.phone);
    const sellerPhone = formatPhone(order.seller?.phone || null);
    const orderCode = order.id.slice(0, 8).toUpperCase();

    // 1. Notify Buyer
    if (buyerPhone) {
      const buyerMsg = `Halo *${order.user.name}*,\n\nPembayaran Anda untuk pesanan *#${orderCode}* telah *DIVERIFIKASI* oleh sistem Rekber Admin.\nPenjual saat ini sedang menyiapkan barang pesanan Anda.\n\nTerima kasih atas kepercayaannya.`;
      const fdBuyer = new FormData();
      fdBuyer.append("target", buyerPhone);
      fdBuyer.append("message", buyerMsg);
      await fetch("https://api.fonnte.com/send", { method: "POST", headers: { Authorization: token }, body: fdBuyer }).catch(console.error);
    }

    // 2. Notify Seller
    if (sellerPhone) {
      let itemsList = order.items.map(i => `- ${i.quantity}x ${i.product.name}`).join("\n");
      const buyerAddress = order.user.address || "Belum diisi";
      const buyerPhoneStr = order.user.phone || "-";
      const sellerMsg = `Halo *${order.seller?.name}*,\n\nPesanan baru dengan kode *#${orderCode}* telah dibayar oleh pembeli dan uang sudah masuk ke sistem Rekber (Admin).\n\n*Rincian Barang:*\n${itemsList}\n\n*Info Pembeli:*\n- Nama: ${order.user.name}\n- No. HP/WA: ${buyerPhoneStr}\n- Alamat: ${buyerAddress}\n\nSilakan segera *Proses dan Kirim Barang* tersebut.\nTerima kasih.`;
      const fdSeller = new FormData();
      fdSeller.append("target", sellerPhone);
      fdSeller.append("message", sellerMsg);
      await fetch("https://api.fonnte.com/send", { method: "POST", headers: { Authorization: token }, body: fdSeller }).catch(console.error);
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Fonnte] Error sending rekber notif:", err);
    return { success: false, error: err.message };
  }
}

// Function to send new order notification to Seller
export async function sendNewOrderToSellerWhatsapp(orderId: string, appUrl: string = "http://localhost:3000") {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, phone: true, address: true, email: true } },
        seller: { select: { name: true, phone: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order || !order.seller?.phone) {
      return { success: false, error: "Order or seller phone not found" };
    }

    const token = process.env.FONNTE_TOKEN;
    if (!token) return { success: false, error: "Fonnte token not configured" };

    let targetPhone = order.seller.phone.trim().replace(/[^0-9]/g, "");
    if (targetPhone.startsWith("0")) targetPhone = "62" + targetPhone.slice(1);
    else if (!targetPhone.startsWith("62")) targetPhone = "62" + targetPhone;

    const orderCode = order.id.slice(0, 8).toUpperCase();
    let itemsList = order.items.map(i => `- ${i.quantity}x ${i.product.name}`).join("\n");
    const buyerAddress = order.user.address || "Belum diisi";
    const buyerPhone = order.user.phone || "-";
    
    const sellerMsg = `Halo *${order.seller.name}*! 🎉\n\n` +
      `Anda mendapatkan *Pesanan Baru* dengan kode *#${orderCode}* dari pembeli *${order.user.name}*.\n\n` +
      `*Rincian Barang:*\n${itemsList}\n\n` +
      `Total Belanja: Rp ${order.totalAmount.toLocaleString("id-ID")}\n` +
      `Metode: ${order.paymentMethod}\n\n` +
      `*📦 Info Pengiriman:*\n` +
      `- Nama: ${order.user.name}\n` +
      `- No. HP/WA: ${buyerPhone}\n` +
      `- Alamat: ${buyerAddress}\n\n` +
      `⚠️ *PENTING:*\nMohon segera proses dan kirim barang maksimal dalam waktu *1x24 jam*. Jika melewati batas waktu, pesanan dapat dibatalkan secara otomatis oleh sistem.\n\n` +
      `Silakan cek detail lengkapnya di Dasbor Kelola Toko:\n${appUrl}/kelola-toko/pesanan`;

    const fdSeller = new FormData();
    fdSeller.append("target", targetPhone);
    fdSeller.append("message", sellerMsg);
    await fetch("https://api.fonnte.com/send", { method: "POST", headers: { Authorization: token }, body: fdSeller });

    return { success: true };
  } catch (err: any) {
    console.error("[Fonnte] Error sending new order notif to seller:", err);
    return { success: false, error: err.message };
  }
}

