import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { db } from "@/lib/db";
import { ProductDetailClient } from "./detail-client";
import { ReviewSection } from "@/components/review-section";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan — Pasar Podosari",
    };
  }

  return {
    title: `${product.name} — Pasar Podosari`,
    description: product.description.substring(0, 160),
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch product from DB
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      seller: true,
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products (same category, excluding current product)
  const relatedProductsRaw = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      stock: { gt: 0 },
    },
    take: 4,
    include: {
      seller: true,
      category: true,
    },
  });

  let parsedImages: string[] = [];
  try {
    if (product.images) parsedImages = JSON.parse(product.images);
  } catch (e) {}

  const adaptedProduct = {
    ...product,
    seller: product.seller?.name || "Penjual",
    sellerId: product.sellerId || product.seller?.id,
    category: product.category?.slug || "",
    images: parsedImages,
  };

  const adaptedRelatedProducts = relatedProductsRaw.map((p) => ({
    ...p,
    seller: p.seller?.name || "Penjual",
    sellerId: p.seller?.id,
    category: p.category?.slug || "",
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ProductDetailClient
            product={adaptedProduct as any}
            relatedProducts={adaptedRelatedProducts as any}
          />
          <ReviewSection productId={product.id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
