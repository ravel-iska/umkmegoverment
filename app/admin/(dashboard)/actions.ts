"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function toggleUserRole(userId: string) {
  try {
    const session = await getSession("admin_session");
    if (!session || session.role !== "Admin") {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found" };

    const newRole = user.role === "Pembeli" ? "Penjual" : "Pembeli";
    
    await db.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    revalidatePath("/admin");
    return { success: true, newRole };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await getSession("admin_session");
    if (!session || session.role !== "Admin") {
      return { success: false, error: "Unauthorized" };
    }

    // Manual cascade deletion
    await db.review.deleteMany({ where: { userId } });
    
    const userOrders = await db.order.findMany({ where: { userId } });
    const orderIds = userOrders.map(o => o.id);
    if (orderIds.length > 0) {
      await db.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await db.order.deleteMany({ where: { userId } });
    }

    const sellerOrders = await db.order.findMany({ where: { sellerId: userId } });
    const sellerOrderIds = sellerOrders.map(o => o.id);
    if (sellerOrderIds.length > 0) {
      await db.orderItem.deleteMany({ where: { orderId: { in: sellerOrderIds } } });
      await db.order.deleteMany({ where: { sellerId: userId } });
    }

    await db.product.deleteMany({ where: { sellerId: userId } });
    await db.user.delete({ where: { id: userId } });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleBlockUser(userId: string) {
  try {
    const session = await getSession("admin_session");
    if (!session || session.role !== "Admin") return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found" };

    await db.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleVerifyUser(userId: string) {
  try {
    const session = await getSession("admin_session");
    if (!session || session.role !== "Admin") return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found" };

    await db.user.update({
      where: { id: userId },
      data: { isVerified: !user.isVerified }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProductAdmin(productId: string) {
  try {
    const session = await getSession("admin_session");
    if (!session || session.role !== "Admin") throw new Error("Unauthorized");

    // Hapus ulasan dan pesanan terkait produk ini terlebih dahulu untuk mencegah error foreign key
    await db.review.deleteMany({ where: { productId } });
    await db.orderItem.deleteMany({ where: { productId } });
    
    await db.product.delete({ where: { id: productId } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }
}
