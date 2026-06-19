"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Minus, Plus, Store, ShoppingCart, MapPin, ArrowRight, Loader2, CheckCircle2, MessageCircle } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);


  const toggleSelectItem = (productId: string) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.product.id));
    }
  };

  const selectedTotal = cart
    .filter((item) => selectedItems.includes(item.product.id))
    .reduce((total, item) => total + item.product.price * item.quantity, 0);



  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">
            Keranjang Belanja
          </h1>

          {cart.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-xl border overflow-hidden">
                  {/* Select All */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <Checkbox
                      checked={selectedItems.length === cart.length}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm">
                      Pilih Semua ({cart.length} produk)
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y">
                    {cart.map((item) => (
                      <div key={item.product.id} className="p-4 flex gap-4">
                        {/* Checkbox */}
                        <Checkbox
                          checked={selectedItems.includes(item.product.id)}
                          onCheckedChange={() =>
                            toggleSelectItem(item.product.id)
                          }
                        />

                        {/* Product Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <Store className="h-3 w-3" />
                            <span>{item.product.seller}</span>
                          </div>
                          <Link
                            href={`/produk/${item.product.slug}`}
                            className="font-semibold hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-primary font-bold mt-1">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        {/* Quantity & Delete */}
                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-card rounded-xl border p-6 sticky top-24">
                  <h2 className="font-bold text-lg mb-6">Ringkasan Belanja</h2>

                  {/* Summary */}
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Produk yang dipilih
                      </span>
                      <span className="text-primary">
                        {selectedItems.length} barang
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary text-lg">
                        {formatPrice(selectedTotal)}
                      </span>
                    </div>
                  </div>

                  <Link href={`/checkout?items=${selectedItems.join(",")}`} className="block w-full mt-6">
                    <Button
                      className="w-full"
                      disabled={selectedItems.length === 0}
                    >
                      Lanjut ke Pembayaran
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-xl border">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-semibold text-lg mb-2">Keranjang kosong</h2>
              <p className="text-muted-foreground mb-6">
                Belum ada produk di keranjang Anda.
              </p>
              <Link href="/produk">
                <Button>Mulai Belanja</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
