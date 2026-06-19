import Link from "next/link";
import { UtensilsCrossed, Palette, Shirt, Sprout, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

const iconMap: Record<string, React.ReactNode> = {
  food:        <UtensilsCrossed className="h-7 w-7 sm:h-8 sm:w-8" />,
  craft:       <Palette className="h-7 w-7 sm:h-8 sm:w-8" />,
  fashion:     <Shirt className="h-7 w-7 sm:h-8 sm:w-8" />,
  agriculture: <Sprout className="h-7 w-7 sm:h-8 sm:w-8" />,
  service:     <Wrench className="h-7 w-7 sm:h-8 sm:w-8" />,
};

const colorMap: Record<string, { bg: string; icon: string; hover: string }> = {
  food:        { bg: "bg-orange-50",  icon: "text-orange-500",  hover: "hover:ring-orange-200" },
  craft:       { bg: "bg-purple-50",  icon: "text-purple-500",  hover: "hover:ring-purple-200" },
  fashion:     { bg: "bg-pink-50",    icon: "text-pink-500",    hover: "hover:ring-pink-200" },
  agriculture: { bg: "bg-green-50",   icon: "text-green-600",   hover: "hover:ring-green-200" },
  service:     { bg: "bg-slate-100",  icon: "text-slate-600",   hover: "hover:ring-slate-200" },
};

export async function CategoriesSection() {
  const categories = await db.category.findMany({
    take: 10,
    orderBy: { name: "asc" }
  });

  return (
    <section className="py-12 sm:py-14 md:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div
          className={cn(
            "text-center mb-8 sm:mb-10 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
          )}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Kategori Produk
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Jelajahi berbagai kategori produk lokal dari Desa Podosari
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">Tidak ada kategori.</div>
          ) : categories.map((category: any, i: number) => {
            const colors = colorMap[category.icon || ""] || colorMap.service;
            return (
              <CategoryCard
                key={category.id}
                category={category}
                colors={colors}
                icon={iconMap[category.icon || ""] || iconMap.service}
                delay={i * 75}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  colors,
  icon,
  delay,
}: {
  category: { name: string; slug: string; description: string | null };
  colors: { bg: string; icon: string; hover: string };
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Link href={`/produk?kategori=${category.slug}`} className="group block">
        <div
          className={cn(
            "rounded-xl p-4 sm:p-5 md:p-6 text-center",
            "transition-all duration-200 cursor-pointer",
            "hover:shadow-md hover:-translate-y-1.5 active:scale-95",
            "ring-2 ring-transparent",
            colors.bg,
            colors.hover
          )}
        >
          <div
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center",
              "bg-white shadow-sm group-hover:scale-110 transition-transform duration-200",
              colors.icon
            )}
          >
            {icon}
          </div>
          <h3 className="font-semibold text-xs sm:text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {category.name}
          </h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
            {category.description}
          </p>
        </div>
      </Link>
    </div>
  );
}
