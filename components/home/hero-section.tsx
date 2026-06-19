"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sparkles, Palette, Leaf, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div>
      <p className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums">
        {value}{suffix}
      </p>
      <p className="text-xs sm:text-sm text-primary-foreground/70 mt-0.5">{label}</p>
    </div>
  );
}

interface HeroSectionProps {
  sellerCount: number;
  productCount: number;
  buyerCount: number;
}

export function HeroSection({ sellerCount, productCount, buyerCount }: HeroSectionProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produk?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/produk");
    }
  };

  return (
    <section className="bg-primary min-h-[520px] sm:min-h-[580px] md:min-h-[640px] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24 relative">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* ── Content ── */}
          <div
            className={cn(
              "text-primary-foreground animate-in fade-in slide-in-from-bottom-4 duration-700"
            )}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-5 sm:mb-6">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300 shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Produk Asli Desa Podosari</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3 sm:mb-4">
              Temukan Keunikan
              <br />
              <span className="text-accent">Produk Lokal Desa</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-primary-foreground/80 mb-6 sm:mb-8 max-w-lg">
              Dukung UMKM Desa Podosari dengan berbelanja produk lokal berkualitas.
              Dari makanan tradisional hingga kerajinan tangan, semua tersedia di sini.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari makanan, kerajinan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 sm:h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-accent rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                className="bg-accent text-accent-foreground hover:bg-accent/90 h-11 sm:h-12 px-6 rounded-xl font-medium"
              >
                Cari
              </Button>
            </form>

            <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-12">
              <Link href="/produk">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-5 sm:px-6 h-10 sm:h-11 text-sm sm:text-base border-white/30 text-primary-foreground hover:bg-white/10 bg-transparent active:scale-95 transition-transform"
                >
                  Jelajahi Semua Katalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Stats dengan counter animasi */}
            <div className="flex gap-6 sm:gap-8 md:gap-12">
              <StatItem value={sellerCount || 7}   suffix="+" label="Penjual Aktif" />
              <StatItem value={productCount || 8}  suffix="+" label="Produk Lokal" />
              <StatItem value={buyerCount || 15}   suffix="+" label="Pembeli Terdaftar" />
            </div>
          </div>

          {/* ── Image ── */}
          <div
            className={cn(
              "relative animate-in fade-in slide-in-from-right-8 duration-700 fill-mode-both"
            )}
            style={{ animationDelay: "200ms" }}
          >
            <div className="relative aspect-[4/3] sm:aspect-[3/2] md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=75&w=900"
                alt="Produk lokal Podosari"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>

            {/* Floating Card: Kerajinan */}
            <div className="absolute -top-3 right-2 sm:-top-4 sm:right-4 md:top-4 md:right-4 bg-white rounded-xl p-2.5 sm:p-3 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">Kerajinan</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Buatan tangan</p>
                </div>
              </div>
            </div>

            {/* Floating Card: Pertanian */}
            <div className="absolute -bottom-3 left-2 sm:-bottom-4 sm:left-0 md:bottom-8 md:left-0 bg-white rounded-xl p-2.5 sm:p-3 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">Hasil Pertanian</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">100% Organik</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
