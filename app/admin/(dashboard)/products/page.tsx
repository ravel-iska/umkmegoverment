import { db } from "@/lib/db";
import { ProductClient } from "./product-client";

export default async function ProductsPage() {
  const productsRaw = await db.product.findMany({
    include: { seller: { select: { name: true } }, category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const products = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    sellerName: p.seller.name,
    categoryName: p.category.name,
    stock: p.stock,
    image: p.image,
  }));

  return <ProductClient initialProducts={products} />;
}
