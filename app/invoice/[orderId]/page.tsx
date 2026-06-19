import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PrintButton } from "./print-button";

export const metadata: Metadata = {
  title: "Invoice Pesanan — Pasar Podosari",
};

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function InvoicePage({ params }: PageProps) {
  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, phone: true, address: true, email: true } },
      seller: { select: { name: true, phone: true } },
      items: {
        include: {
          product: { select: { name: true, image: true } },
        },
      },
    },
  });

  if (!order) notFound();

  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const orderDate = new Date(order.createdAt).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const statusColor: Record<string, string> = {
    Pending: "#f59e0b",
    Diproses: "#3b82f6",
    Dikirim: "#8b5cf6",
    Selesai: "#10b981",
    Dibatalkan: "#ef4444",
  };

  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Invoice #{orderId.slice(0, 8).toUpperCase()} — Pasar Podosari</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; color: #1a1a1a; }
          .page { max-width: 700px; margin: 24px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
          .header { background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 32px 36px; color: white; }
          .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
          .logo-area h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .logo-area p { font-size: 12px; opacity: 0.8; margin-top: 2px; }
          .invoice-label { text-align: right; }
          .invoice-label p { font-size: 12px; opacity: 0.8; }
          .invoice-label h2 { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
          .invoice-meta { margin-top: 20px; display: flex; gap: 32px; }
          .meta-item p:first-child { font-size: 10px; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.5px; }
          .meta-item p:last-child { font-size: 14px; font-weight: 600; }
          .body { padding: 32px 36px; }
          .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
          .party-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
          .party-card h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px; font-weight: 700; }
          .party-card p { font-size: 13px; line-height: 1.7; }
          .party-card .name { font-weight: 700; font-size: 14px; color: #111827; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table thead tr { background: #f3f4f6; }
          .items-table th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; font-weight: 700; }
          .items-table th:last-child { text-align: right; }
          .items-table td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; vertical-align: middle; }
          .items-table td:last-child { text-align: right; font-weight: 600; }
          .items-table tbody tr:last-child td { border-bottom: none; }
          .totals { border-top: 2px solid #e5e7eb; padding-top: 16px; }
          .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
          .total-row.grand { font-size: 16px; font-weight: 800; color: #15803d; border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 12px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; }
          .payment-info { margin-top: 24px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; }
          .payment-info h3 { font-size: 12px; font-weight: 700; color: #1d4ed8; margin-bottom: 8px; }
          .payment-info p { font-size: 13px; color: #1e40af; }
          .footer-note { margin-top: 28px; text-align: center; font-size: 11px; color: #9ca3af; line-height: 1.6; }
          .footer-note strong { color: #6b7280; }
          @media print {
            body { background: white; }
            .page { box-shadow: none; margin: 0; border-radius: 0; }
            .no-print { display: none !important; }
          }
        `}</style>
      </head>
      <body>
        <PrintButton />
        <div className="page">
          {/* Header */}
          <div className="header">
            <div className="header-top">
              <div className="logo-area">
                <h1>🛒 Pasar Podosari</h1>
                <p>Marketplace UMKM Lokal — Podosari, Pringsewu</p>
              </div>
              <div className="invoice-label">
                <p>INVOICE</p>
                <h2>#{orderId.slice(0, 8).toUpperCase()}</h2>
              </div>
            </div>
            <div className="invoice-meta">
              <div className="meta-item">
                <p>Tanggal Pesanan</p>
                <p>{orderDate}</p>
              </div>
              <div className="meta-item">
                <p>Status</p>
                <p>
                  <span className="status-badge" style={{ backgroundColor: statusColor[order.status] || "#6b7280" }}>
                    {order.status}
                  </span>
                </p>
              </div>
              <div className="meta-item">
                <p>Pembayaran</p>
                <p>{order.paymentMethod === "COD" ? "Bayar di Tempat" : "Transfer Bank"}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="body">
            {/* Pihak-pihak */}
            <div className="parties">
              <div className="party-card">
                <h3>Pembeli</h3>
                <p className="name">{order.user.name}</p>
                {order.user.email && <p>{order.user.email}</p>}
                {order.user.phone && <p>📱 {order.user.phone}</p>}
                {order.user.address && <p>📍 {order.user.address}</p>}
              </div>
              <div className="party-card">
                <h3>Penjual</h3>
                <p className="name">{order.seller?.name || "Penjual"}</p>
                {order.seller?.phone && <p>📱 {order.seller.phone}</p>}
                <p style={{ marginTop: "4px", fontSize: "11px", color: "#6b7280" }}>Pasar UMKM Podosari</p>
              </div>
            </div>

            {/* Item Table */}
            <table className="items-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Harga Satuan</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.product.name}</strong>
                    </td>
                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>Rp {item.price.toLocaleString("id-ID")}</td>
                    <td>Rp {(item.price * item.quantity).toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="total-row">
                <span>Ongkos Kirim</span>
                <span>Gratis</span>
              </div>
              <div className="total-row grand">
                <span>Total Tagihan</span>
                <span>Rp {order.totalAmount.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Payment Info */}
            {order.paymentMethod === "TRANSFER" && order.paymentProof && (
              <div className="payment-info">
                <h3>📋 Informasi Pembayaran</h3>
                <p>Metode: Transfer Bank</p>
                <p>Bukti transfer telah diunggah oleh pembeli.</p>
              </div>
            )}

            {/* Footer */}
            <div className="footer-note">
              <p>Terima kasih telah berbelanja di <strong>Pasar Podosari</strong>!</p>
              <p>Invoice ini dihasilkan secara otomatis dan sah tanpa tanda tangan.</p>
              <p style={{ marginTop: "6px" }}>📧 support@pasarpodosari.id | 🌐 pasarpodosari.id</p>
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            document.querySelector('button[onClick]')?.addEventListener('click', () => window.print());
          `
        }} />
      </body>
    </html>
  );
}
