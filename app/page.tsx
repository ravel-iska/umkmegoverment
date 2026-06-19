import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { FeaturesSection } from "@/components/home/features-section";
import { db } from "@/lib/db";

// SSG: metadata statis
export const metadata: Metadata = {
  title: "Pasar Podosari — Marketplace Produk Lokal Desa",
  description:
    "Temukan produk UMKM terbaik dari Desa Podosari, Lampung. Makanan, kerajinan, fesyen, dan hasil pertanian organik.",
  openGraph: {
    title: "Pasar Podosari",
    description: "Marketplace digital UMKM Desa Podosari",
    type: "website",
  },
};

// SSG: halaman ini di-render statis saat build
export const revalidate = 3600; // ISR: refresh setiap 1 jam

// Halaman ini tidak lagi menggunakan lazy loading client-side yang lambat
// Komponen akan dirender langsung di server.

export default async function HomePage() {
  // Fetch real statistics from database
  const [sellerCount, productCount, buyerCount] = await Promise.all([
    db.user.count({ where: { role: "Penjual" } }),
    db.product.count(),
    db.user.count({ where: { role: "Pembeli" } }),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero: critical — tidak di-lazy */}
        <HeroSection 
          sellerCount={sellerCount}
          productCount={productCount}
          buyerCount={buyerCount}
        />

        {/* Server Components */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center animate-pulse bg-muted/20">Memuat kategori...</div>}>
          <CategoriesSection />
        </Suspense>
        <Suspense fallback={<div className="h-96 flex items-center justify-center animate-pulse bg-muted/20">Memuat produk...</div>}>
          <FeaturedProducts />
        </Suspense>
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
