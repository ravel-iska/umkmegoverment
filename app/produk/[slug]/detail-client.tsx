"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Star, 
  Store, 
  Check, 
  Plus, 
  Minus, 
  ShieldCheck,
  PackageCheck,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProductMediaSlider } from "./product-media-slider";
import { openChatWith } from "@/components/chat/live-chat";

interface AdaptedProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
  stock: number;
  rating: number;
  sold: number;
  featured: boolean;
  categoryId: string;
  sellerId: string;
  seller: string;
  category: string;
  images: string[] | null;
  video: string | null;
}

interface ProductDetailClientProps {
  product: AdaptedProduct;
  relatedProducts: AdaptedProduct[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, cart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success("Dihapus dari Wishlist");
    } else {
      addToWishlist(product as any);
      toast.success("Ditambahkan ke Wishlist");
    }
  };

  const handleAddToCart = () => {
    // Add multiple quantities
    for (let i = 0; i < quantity; i++) {
      addToCart(product as any);
    }
    setIsAdded(true);
    toast.success(`${quantity} produk berhasil ditambahkan ke keranjang`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const incrementQty = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else {
      toast.error("Batas stok maksimum tercapai");
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      {/* Back & Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-8 text-sm text-muted-foreground">
        <Link href="/produk" className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Link>
        <span>&bull;</span>
        <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span>/</span>
        <Link href="/produk" className="hover:text-primary transition-colors">Produk</Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main product card layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-card border rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
        {/* Left Side: Product Image & Media Slider */}
        <div className="space-y-4">
          <ProductMediaSlider 
            image={product.image} 
            images={product.images} 
            video={product.video} 
            name={product.name} 
          />
          {product.featured && (
            <Badge className="absolute top-4 left-4 bg-amber-500 hover:bg-amber-500 text-white text-xs px-2.5 py-1 z-20 shadow-md">
              Produk Unggulan
            </Badge>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Seller Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-3 rounded-xl border border-muted">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-3 py-1.5 rounded-lg w-fit shadow-sm border">
                <Store className="h-4 w-4 text-primary shrink-0" />
                {(product as any).sellerId ? (
                  <Link href={`/toko/${(product as any).sellerId}`} className="font-semibold text-foreground hover:text-primary hover:underline">
                    {product.seller}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground">{product.seller}</span>
                )}
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                  UMKM Podosari
                </Badge>
              </div>
              
              {(product as any).sellerId && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white"
                  onClick={() => openChatWith((product as any).sellerId)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> Chat Penjual
                </Button>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-foreground">
              {product.name}
            </h1>

            {/* Rating & Sold counts */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground border-b pb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-foreground">{product.rating}</span>
              </div>
              <span>&bull;</span>
              <span>{product.sold} Terjual</span>
              <span>&bull;</span>
              <div className="flex items-center gap-1 text-emerald-600 font-medium">
                <PackageCheck className="h-4 w-4 shrink-0" />
                <span>Stok: {product.stock}</span>
              </div>
            </div>

            {/* Price section */}
            <div className="py-2">
              <span className="text-3xl font-black text-primary">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Deskripsi Produk</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description || "Tidak ada deskripsi untuk produk ini."}
              </p>
            </div>
          </div>

          {/* Interactive actions & checkout block */}
          <div className="space-y-4 pt-4 border-t">
            {/* Quantity Selector & Wishlist */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-xl bg-card p-1 shadow-sm shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={decrementQty}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-10 text-center font-semibold text-sm">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={incrementQty}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Wishlist Button */}
              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                className={cn(
                  "rounded-xl gap-2 flex-1 sm:flex-initial",
                  inWishlist && "border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600"
                )}
              >
                <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                <span className="hidden sm:inline">
                  {inWishlist ? "Disukai" : "Tambah ke Wishlist"}
                </span>
              </Button>
            </div>

            {/* Main Add to Cart CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={cn(
                  "w-full sm:flex-1 rounded-xl shadow-md gap-2 font-bold py-6 text-base transition-all duration-300",
                  isAdded && "bg-emerald-600 hover:bg-emerald-600"
                )}
              >
                {isAdded ? (
                  <>
                    <Check className="h-5 w-5" />
                    Berhasil Ditambahkan!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Tambah ke Keranjang
                  </>
                )}
              </Button>

              <Link href={`/checkout?directBuy=true&productId=${product.id}&quantity=${quantity}`} className="w-full sm:flex-1" tabIndex={-1}>
                <Button
                  size="lg"
                  disabled={product.stock <= 0}
                  variant="secondary"
                  className="w-full rounded-xl shadow-sm font-bold py-6 text-base border-2 hover:bg-secondary/80 transition-all duration-300"
                >
                  Beli
                </Button>
              </Link>
            </div>

            {/* Trust and Safety badges */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 justify-center sm:justify-start">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Jaminan transaksi aman, UMKM Lokal asli, & langsung diproses.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-12 sm:mt-16 md:mt-20">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
          <span>Produk Serupa</span>
          <Badge variant="secondary" className="font-normal">{relatedProducts.length}</Badge>
        </h2>

        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-muted/10 border border-dashed rounded-xl">
            <p className="text-muted-foreground text-sm">Tidak ada produk serupa lainnya di kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
