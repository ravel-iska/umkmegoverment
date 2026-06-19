"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Store, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatPrice, type Product } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const inWishlist = isMounted ? isInWishlist(product.id) : false;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1200);
  };

  const handleStoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((product as any).sellerId) {
      router.push(`/toko/${(product as any).sellerId}`);
    }
  };

  return (
    <Link href={`/produk/${product.slug}`} className="group block">
      <div className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />

          {product.featured && (
            <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-amber-500 hover:bg-amber-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2">
              Unggulan
            </Badge>
          )}

          {/* Wishlist button — touch target min 44px */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-2 right-2 sm:top-3 sm:right-3",
              "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center",
              "bg-white/90 hover:bg-white shadow-sm",
              "transition-all duration-150 active:scale-90",
              inWishlist && "bg-red-50"
            )}
            aria-label={inWishlist ? "Hapus dari wishlist" : "Tambah ke wishlist"}
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors",
                inWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          {/* Seller */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 relative z-10">
            <Store className="h-3 w-3 shrink-0" />
            {(product as any).sellerId ? (
              <button 
                onClick={handleStoreClick} 
                className="truncate hover:text-primary hover:underline text-left"
              >
                {product.seller}
              </button>
            ) : (
              <span className="truncate">{product.seller}</span>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating & Sold */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{product.rating}</span>
            </div>
            <span>&bull;</span>
            <span>{product.sold} terjual</span>
          </div>

          {/* Price & Cart */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-primary text-sm sm:text-base truncate">
              {formatPrice(product.price)}
            </span>
            {/* Touch target min 44px */}
            <button
              onClick={handleAddToCart}
              className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0",
                "transition-all duration-150 active:scale-90",
                addedFeedback
                  ? "bg-emerald-500 text-white scale-105"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
              aria-label="Tambah ke keranjang"
            >
              {addedFeedback
                ? <Check className="h-4 w-4" />
                : <ShoppingCart className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
