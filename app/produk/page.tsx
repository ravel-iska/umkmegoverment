import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProdukClient } from "./produk-client";
import { db } from "@/lib/db";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produk Lokal — Pasar Podosari",
  description: "Temukan semua produk UMKM terbaik dari Desa Podosari, Lampung.",
};

// ISR: halaman di-build sekali, lalu di-cache selama 1 jam
// Navigasi ke halaman ini = instant dari cache, tidak query DB tiap klik
export const revalidate = 3600;

async function ProductFetcher() {
  const products = await db.product.findMany({
    where: { stock: { gt: 0 } },
    include: { seller: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return <ProdukClient initialProducts={products as any} categories={categories as any} />;
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse">Menyiapkan katalog produk...</p>
            </div>
          }
        >
          <ProductFetcher />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
