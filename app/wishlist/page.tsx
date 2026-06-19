"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";
import { Trash2, ShoppingCart, Store, Heart } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useStore();

  const handleMoveToCart = (productId: string) => {
    const item = wishlist.find((w) => w.product.id === productId);
    if (item) {
      addToCart(item.product);
      removeFromWishlist(productId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">
            Daftar Keinginan Saya
          </h1>

          {wishlist.length > 0 ? (
            <div className="bg-card rounded-xl border divide-y">
              {wishlist.map((item) => (
                <div
                  key={item.product.id}
                  className="p-4 flex items-center gap-4"
                >
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

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromWishlist(item.product.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => handleMoveToCart(item.product.id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-xl border">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-semibold text-lg mb-2">
                Daftar keinginan kosong
              </h2>
              <p className="text-muted-foreground mb-6">
                Simpan produk favorit Anda untuk dibeli nanti.
              </p>
              <Link href="/produk">
                <Button>Jelajahi Produk</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
