import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ProdukClient } from "./produk-client";

export default async function ProdukPage() {
  const session = await getSession();

  if (!session || (session.role !== "Penjual" && session.role !== "Admin")) {
    redirect("/login");
  }

  const userWithProducts = await db.user.findUnique({
    where: { id: session.id },
    include: {
      products: {
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const products = (userWithProducts?.products || []).map((p) => ({
    id: p.id,
    nama: p.name,
    harga: p.price,
    stok: p.stock,
    terjual: p.sold,
    rating: p.rating,
    kategori: p.category.name,
    categoryId: p.categoryId,
    deskripsi: p.description,
    image: p.image,
    featured: p.featured,
  }));

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <ProdukClient
      initialProducts={products}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
