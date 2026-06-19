import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { Store, CalendarDays, Phone, MapPin, SearchX } from "lucide-react";
import { StoreCoverSlider } from "./store-cover-slider";
import { StoreChatButton } from "./chat-button";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = await db.user.findUnique({
    where: { id },
  });

  if (!seller || seller.role !== "Penjual") {
    return {
      title: "Toko Tidak Ditemukan — Pasar Podosari",
    };
  }

  return {
    title: `Toko ${seller.name} — Pasar Podosari`,
    description: `Katalog produk resmi dari toko ${seller.name} di Pasar Podosari.`,
  };
}

export default async function StoreProfilePage({ params }: PageProps) {
  const { id } = await params;

  // Fetch seller info
  const seller = await db.user.findUnique({
    where: { id },
    include: {
      products: {
        where: { stock: { gt: 0 } },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!seller || seller.role !== "Penjual") {
    notFound();
  }

  const joinDate = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(seller.createdAt));

  let covers: string[] = [];
  try {
    if (seller.coverImages) {
      covers = JSON.parse(seller.coverImages);
    }
  } catch (e) {}

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Store Banner & Profile Header */}
        <div className="bg-primary/5 border-b pb-8">
          <div className="h-32 sm:h-48 md:h-64 bg-primary/10 w-full relative overflow-hidden">
            <StoreCoverSlider covers={covers} />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 sm:-mt-16 md:-mt-20">
              {/* Store Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl border-4 border-background bg-card shadow-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                {seller.avatar ? (
                  <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-10 h-10 sm:w-16 sm:h-16 text-muted-foreground/50" />
                )}
              </div>
              
              {/* Store Info */}
              <div className="flex-1 pb-2 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">{seller.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {seller.address && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{seller.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" />
                        <span>Bergabung {joinDate}</span>
                      </div>
                      {seller.isVerified && (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-200">
                          Terverifikasi
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {seller.phone && (
                    <a 
                      href={`https://wa.me/${seller.phone.replace(/^0/, "62")}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shrink-0"
                    >
                      <Phone className="w-4 h-4" />
                      Hubungi WA
                    </a>
                  )}
                  <StoreChatButton sellerId={seller.id} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Catalog */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">Katalog Produk</h2>
            <div className="text-sm text-muted-foreground">
              {seller.products.length} produk aktif
            </div>
          </div>

          {seller.products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {seller.products.map((p) => {
                const adaptedProduct = {
                  ...p,
                  seller: seller.name,
                  sellerId: seller.id,
                  category: p.category?.slug || "",
                };
                return <ProductCard key={p.id} product={adaptedProduct as any} />;
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border border-dashed">
              <SearchX className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-bold mb-1">Belum Ada Produk</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Toko ini belum menambahkan produk atau stok produk sedang kosong. Coba kembali lagi nanti!
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
