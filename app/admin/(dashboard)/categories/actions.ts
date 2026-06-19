"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function addCategory(formData: FormData) {
  const session = await getSession("admin_session");
  if (!session || session.role !== "Admin") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;
  const color = formData.get("color") as string;

  if (!name) throw new Error("Nama kategori wajib diisi");

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  await db.category.create({
    data: {
      name,
      slug,
      description,
      icon,
      color
    }
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await getSession("admin_session");
  if (!session || session.role !== "Admin") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;
  const color = formData.get("color") as string;

  if (!name) throw new Error("Nama kategori wajib diisi");

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  await db.category.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      icon,
      color
    }
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await getSession("admin_session");
  if (!session || session.role !== "Admin") throw new Error("Unauthorized");

  // Periksa apakah ada produk dalam kategori ini
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error("Tidak dapat menghapus kategori yang masih memiliki produk.");
  }

  await db.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
  return { success: true };
}
