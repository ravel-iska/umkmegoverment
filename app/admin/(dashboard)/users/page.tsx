import { db } from "@/lib/db";
import { UserClient } from "./user-client";

export default async function UsersPage() {
  const usersRaw = await db.user.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  const users = usersRaw.map((u) => ({
    id: u.id,
    email: u.email,
    nama: u.name,
    role: u.role as any,
    bergabung: u.createdAt.toISOString().split("T")[0],
    transaksi: u._count.orders,
    isBlocked: u.isBlocked,
    isVerified: u.isVerified,
  }));

  return <UserClient initialUsers={users} />;
}
