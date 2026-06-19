"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Store, MapPin, ArrowRight, Loader2, CheckCircle2, MessageCircle } from "lucide-react";

function CheckoutForm() {
  const { cart, removeFromCart } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use state for items to support both cart and direct buy
  const [itemsToCheckout, setItemsToCheckout] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const isDirectBuy = searchParams.get("directBuy") === "true";
  const directProductId = searchParams.get("productId");
  const directQuantity = parseInt(searchParams.get("quantity") || "1", 10);

  const selectedItems = useMemo(() => {
    const itemsParam = searchParams.get("items");
    return itemsParam ? itemsParam.split(",").filter(Boolean) : [];
  }, [searchParams]);

  useEffect(() => {
    if (isDirectBuy && directProductId) {
      // Fetch direct product
      fetch(`/api/products/${directProductId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            const item = {
              product: data,
              quantity: directQuantity
            };
            setItemsToCheckout([item]);
            setTotalAmount(data.price * directQuantity);
          }
        })
        .catch(console.error);
    } else {
      // Use cart items
      const selectedCartItems = cart.filter((item) => selectedItems.includes(item.product.id));
      setItemsToCheckout(selectedCartItems);
      setTotalAmount(selectedCartItems.reduce((total, item) => total + item.product.price * item.quantity, 0));
    }
  }, [isDirectBuy, directProductId, directQuantity, cart, selectedItems]);

  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);

  // Fill in user data if logged in
  useEffect(() => {
    if (user && user.isLoggedIn) {
      setBuyerName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);



  const handleCheckout = async () => {
    if (!user || !user.isLoggedIn) {
      if (!buyerName.trim()) {
        toast.error("Nama lengkap pembeli wajib diisi.");
        return;
      }
    }

    if (!shippingAddress.trim()) {
      toast.error("Alamat pengiriman wajib diisi.");
      return;
    }

    if (!phone.trim()) {
      toast.error("Nomor telepon wajib diisi.");
      return;
    }


    if (itemsToCheckout.length === 0) {
      toast.error("Tidak ada produk yang dipilih untuk checkout.");
      return;
    }

    setIsLoading(true);
    try {
      const itemsToOrder = itemsToCheckout.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsToOrder,
          shippingAddress,
          phone,
          notes,
          buyerName: user?.isLoggedIn ? user.name : buyerName,
          email: user?.isLoggedIn ? user.email : email,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses checkout.");
      }

      toast.success("Checkout berhasil!");
      
      // Hapus item dari keranjang
      if (!isDirectBuy) {
        selectedItems.forEach((id: string) => {
          removeFromCart(id);
        });
      } else if (directProductId) {
        // Hapus juga dari keranjang jika produk tersebut kebetulan ada di keranjang
        removeFromCart(directProductId);
      }
      
      setCheckoutData(data);
      setCheckoutSuccess(true);
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat checkout.");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="max-w-md mx-auto bg-card border rounded-2xl p-8 text-center shadow-lg space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Pesanan Berhasil Dibuat!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Terima kasih atas pesanan Anda. Silakan hubungi Penjual melalui WhatsApp untuk konfirmasi pesanan Anda.
          </p>
        </div>
        
        {checkoutData?.orders?.map((order: any, idx: number) => {
          const rawPhone = order.sellerPhone ? order.sellerPhone.replace(/[^0-9]/g, "") : "";
          const waNumber = rawPhone.startsWith("0") ? "62" + rawPhone.slice(1) : rawPhone;

          // Build WA message
          const buyerNameFinal = user?.isLoggedIn ? user.name : buyerName;
          let waMessage = `Halo Kak ${order.sellerName || "Penjual"} 👋\n\nSaya *${buyerNameFinal || "Pembeli"}* ingin mengonfirmasi pesanan.\n\n`;
          waMessage += `📦 *Detail Pesanan (ID: ${order.orderId.slice(0, 8)}...)*\n`;
          order.items.forEach((item: any) => {
            waMessage += `• ${item.quantity}x ${item.name} — Rp ${item.price.toLocaleString("id-ID")}\n`;
          });
          waMessage += `\n💰 *Total: Rp ${order.totalAmount.toLocaleString("id-ID")}*\n`;
          waMessage += `💳 Pembayaran: Bayar di Tempat (COD)\n`;
          if (shippingAddress) waMessage += `📍 Alamat: ${shippingAddress}\n`;
          if (notes) waMessage += `📝 Catatan: ${notes}\n`;
          waMessage += `\nMohon segera dikonfirmasi ya. Terima kasih! 🙏`;

          if (!waNumber) {
            return (
              <div key={idx} className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 text-left">
                ⚠️ Penjual <b>{order.sellerName || "ini"}</b> belum mendaftarkan nomor WhatsApp. Silakan hubungi admin pasar untuk konfirmasi pesanan.
              </div>
            );
          }

          return (
            <a
              key={idx}
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white py-3 px-4 rounded-xl font-bold transition-colors shadow-sm"
            >
              <MessageCircle className="h-5 w-5" />
              Konfirmasi ke WA {order.sellerName || `Penjual ${idx + 1}`}
            </a>
          );
        })}

        <div className="flex flex-col gap-3 pt-2">
          <Link href="/produk" className="w-full">
            <Button className="w-full rounded-xl">Lanjutkan Belanja</Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full rounded-xl">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (itemsToCheckout.length === 0 && !isLoading) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-card rounded-xl border">
        <h2 className="font-semibold text-lg mb-2">Tidak ada produk</h2>
        <p className="text-muted-foreground mb-6">Pilih produk di keranjang terlebih dahulu.</p>
        <Link href="/keranjang">
          <Button>Kembali ke Keranjang</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      {/* Kolom Detail Pengiriman */}
      <div className="bg-card rounded-xl border p-6 space-y-6">
        <h2 className="font-bold text-xl">Informasi Pengiriman</h2>

        {/* Guest Buyer Information */}
        {(!user || !user.isLoggedIn) && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nama Lengkap</label>
              <Input
                placeholder="Nama lengkap penerima"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email (opsional)</label>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t">
          <div>
            <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Alamat Pengiriman
            </label>
            <Textarea
              placeholder="Masukkan alamat lengkap (Jalan, RT/RW, Desa, dll)"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Nomor Telepon / WA</label>
            <Input
              placeholder="08xx-xxxx-xxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Catatan (opsional)</label>
            <Textarea
              placeholder="Catatan untuk penjual"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="pt-4 border-t">
          <label className="text-sm font-bold text-primary mb-3 block">Metode Pembayaran</label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                readOnly
                className="w-4 h-4 text-primary"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Bayar di Tempat (COD) / Transfer Langsung</span>
                <span className="text-xs text-muted-foreground">Pembayaran disepakati langsung dengan penjual</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Kolom Ringkasan Pesanan */}
      <div>
        <div className="bg-card rounded-xl border p-6 sticky top-24">
          <h2 className="font-bold text-lg mb-6">Ringkasan Pesanan</h2>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2">
            {itemsToCheckout.map((item) => (
              <div key={item.product.id} className="flex gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image src={item.product.image || "/images/placeholder.png"} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-2">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.quantity} x {formatPrice(item.product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Harga Produk</span>
              <span className="font-medium">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-lg">
              <span>Total Tagihan</span>
              <span className="text-primary">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <Button
            className="w-full mt-6 rounded-xl h-11"
            disabled={itemsToCheckout.length === 0 || isLoading}
            onClick={handleCheckout}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Buat Pesanan
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-1 py-8 px-4">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <CheckoutForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
