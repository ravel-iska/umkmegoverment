"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Grid3X3, LayoutGrid } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/data";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
  categoryId: string;
  sellerId: string;
  rating: number;
  sold: number;
  featured: boolean;
  category?: { slug: string };
  seller?: { name: string };
};

export function ProdukClient({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("kategori") || "";
  const initialSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("terbaru");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.seller?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }

    // Price filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Featured filter
    if (featuredOnly) {
      result = result.filter((p) => p.featured);
    }

    // Sort
    switch (sortBy) {
      case "harga-rendah":
        result.sort((a, b) => a.price - b.price);
        break;
      case "harga-tinggi":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "terlaris":
        result.sort((a, b) => b.sold - a.sold);
        break;
      default:
        // terbaru - keep original order
        break;
    }

    return result;
  }, [initialProducts, searchQuery, selectedCategory, priceRange, featuredOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Title */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Produk Lokal Podosari
      </h1>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="terbaru">Terbaru</SelectItem>
              <SelectItem value="harga-rendah">Harga Terendah</SelectItem>
              <SelectItem value="harga-tinggi">Harga Tertinggi</SelectItem>
              <SelectItem value="rating">Rating Tertinggi</SelectItem>
              <SelectItem value="terlaris">Terlaris</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={cn(viewMode === "grid" && "bg-muted")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("compact")}
              className={cn(viewMode === "compact" && "bg-muted")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-card rounded-xl border p-6 sticky top-24">
            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Kategori</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      !selectedCategory
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    Semua Produk
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.slug)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedCategory === category.slug
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Rentang Harga</h3>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000000}
                step={10000}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatPrice(priceRange[0])}</span>
                <span>-</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>

            {/* Featured Only */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="featured"
                checked={featuredOnly}
                onCheckedChange={(checked) =>
                  setFeaturedOnly(checked as boolean)
                }
              />
              <label
                htmlFor="featured"
                className="text-sm cursor-pointer"
              >
                Produk Unggulan Saja
              </label>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            Menampilkan {filteredProducts.length} produk
          </p>

          {filteredProducts.length > 0 ? (
            <div
              className={cn(
                "grid gap-4",
                viewMode === "grid"
                  ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-2 md:grid-cols-3"
              )}
            >
              {filteredProducts.map((product: any) => {
                const adaptedProduct = {
                  ...product,
                  seller: product.seller?.name || "Penjual Anonim",
                  sellerId: product.sellerId || product.seller?.id,
                  category: product.category?.slug || "",
                };
                return <ProductCard key={product.id} product={adaptedProduct} />;
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Tidak ada produk yang ditemukan.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setPriceRange([0, 1000000]);
                  setFeaturedOnly(false);
                }}
              >
                Reset Filter
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
