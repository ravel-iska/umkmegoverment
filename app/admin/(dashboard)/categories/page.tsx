import { db } from "@/lib/db";
import { CategoryClient } from "./category-client";

export default async function CategoriesPage() {
  const categoriesRaw = await db.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: "asc" }
  });

  const categories = categoriesRaw.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || "",
    icon: c.icon || "",
    color: c.color || "",
    productCount: c._count.products
  }));

  return <CategoryClient initialCategories={categories} />;
}
