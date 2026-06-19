import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

function ProductSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-muted rounded w-1/3" />
          <div className="h-9 w-9 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export async function FeaturedProducts() {
  const data = await db.product.findMany({
    where: { featured: true, stock: { gt: 0 } },
    take: 4,
    include: { seller: true, category: true }
  });

  const featuredProducts = data.map((p) => ({
    ...p,
    seller: p.seller?.name || "Penjual",
    sellerId: p.seller?.id,
    category: p.category?.slug || ""
  }));

  return (
    <section className="py-12 sm:py-14 md:py-16 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className={cn(
            "flex items-start sm:items-center justify-between mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 gap-4"
          )}
        >
          <div>
            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
              Produk Unggulan
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Produk terbaik pilihan kami untuk Anda
            </p>
          </div>
          <Link href="/produk" className="hidden md:block shrink-0">
            <Button variant="outline" className="rounded-full text-sm">
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {featuredProducts.length > 0
            ? featuredProducts.map((product: any, i: number) => (
                <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${i * 100}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))
            : <div className="col-span-full text-center text-muted-foreground">Tidak ada produk unggulan.</div>}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 sm:mt-8 text-center md:hidden">
          <Link href="/produk">
            <Button variant="outline" className="rounded-full text-sm w-full sm:w-auto">
              Lihat Semua Produk
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
