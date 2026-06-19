import { PrismaClient } from "@prisma/client";
import { categories, products } from "../lib/data";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai seeder database...");

  // Hapus semua data yang ada sebelumnya (opsional)
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Buat User dummy (Penjual)
  const sellers = Array.from(new Set(products.map((p) => p.seller)));
  const sellerMap: Record<string, string> = {};

  for (const sellerName of sellers) {
    const user = await prisma.user.create({
      data: {
        email: `${sellerName.replace(/\s+/g, "").toLowerCase()}@example.com`,
        name: sellerName,
        role: "Penjual",
        password: bcrypt.hashSync("password123", 10),
      },
    });
    sellerMap[sellerName] = user.id;
  }
  console.log(`Berhasil membuat ${sellers.length} penjual.`);

  // 2. Buat Kategori
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
      },
    });
    categoryMap[cat.slug] = category.id;
  }
  console.log(`Berhasil membuat ${categories.length} kategori.`);

  // 3. Buat Produk
  for (const prod of products) {
    await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        image: prod.image,
        rating: prod.rating,
        sold: prod.sold,
        featured: prod.featured,
        categoryId: categoryMap[prod.category],
        sellerId: sellerMap[prod.seller],
      },
    });
  }
  console.log(`Berhasil membuat ${products.length} produk.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
