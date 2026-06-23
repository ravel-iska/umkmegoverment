"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { sendInvoiceToWhatsapp } from "@/lib/fonnte";
import { headers } from "next/headers";

function isSellerOrAdmin(role: string | null | undefined) {
  return role === "Penjual" || role === "Admin";
}

export async function createProduct(data: {
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  description: string;
  image?: string;
  images?: string;
  video?: string;
}) {
  const session = await getSession();
  if (!session || !isSellerOrAdmin(session.role)) {
    throw new Error("Unauthorized");
  }

  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  await db.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
      sellerId: session.id,
      image: data.image || null,
      images: data.images || null,
      video: data.video || null,
    },
  });

  revalidatePath("/kelola-toko");
  return { success: true };
}

export async function updateProduct(
  productId: string,
  data: {
    name: string;
    price: number;
    stock: number;
    categoryId: string;
    description: string;
    image?: string;
    images?: string;
    video?: string;
  }
) {
  const session = await getSession();
  if (!session || !isSellerOrAdmin(session.role)) {
    throw new Error("Unauthorized");
  }

  // Admin bisa edit produk siapa saja, Penjual hanya miliknya sendiri
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Produk tidak ditemukan");
  if (session.role === "Penjual" && product.sellerId !== session.id) {
    throw new Error("Unauthorized");
  }

  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  await db.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
      image: data.image || null,
      images: data.images || null,
      video: data.video || null,
    },
  });

  revalidatePath("/kelola-toko");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const session = await getSession();
  if (!session || !isSellerOrAdmin(session.role)) {
    throw new Error("Unauthorized");
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Produk tidak ditemukan");
  if (session.role === "Penjual" && product.sellerId !== session.id) {
    throw new Error("Unauthorized");
  }

  // Hapus relasi yang terkait agar tidak ada foreign key error
  await db.review.deleteMany({ where: { productId } });
  await db.orderItem.deleteMany({ where: { productId } });
  await db.product.delete({ where: { id: productId } });

  revalidatePath("/kelola-toko");
  return { success: true };
}

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
  const session = await getSession();
  if (!session || !isSellerOrAdmin(session.role)) {
    throw new Error("Unauthorized");
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Pesanan tidak ditemukan");
  if (session.role === "Penjual" && order.sellerId !== session.id) {
    throw new Error("Unauthorized");
  }

  await db.order.update({
    where: { id: orderId },
    data: { 
      status,
      ...(trackingNumber !== undefined && { trackingNumber })
    },
  });

  // Jika pengiriman berhasil/selesai, kirim invoice text link ke WA pembeli via Fonnte
  if (status === "Dikirim" || status === "Selesai") {
    // Jalankan secara asinkron agar tidak memblokir respon UI
    (async () => {
      try {
        const headerList = await headers();
        const host = headerList.get("host");
        const protocol = host?.includes("localhost") ? "http" : "https";
        const appUrl = `${protocol}://${host}`;
        await sendInvoiceToWhatsapp(orderId, appUrl);
      } catch (err) {
        console.error("[Fonnte] Error sending invoice asynchronously:", err);
      }
    })();
  }

  revalidatePath("/kelola-toko");
  return { success: true };
}
