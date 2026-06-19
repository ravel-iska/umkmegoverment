import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { PengaturanClient } from "./pengaturan-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan Toko — Dasbor Penjual",
};

export default async function PengaturanPage() {
  const session = await getSession();

  if (!session || (session.role !== "Penjual" && session.role !== "Admin")) {
    redirect("/profil");
  }

  const user = await db.user.findUnique({
    where: { id: session.id },
  });

  if (!user) {
    redirect("/login");
  }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Toko</h1>
          <p className="text-muted-foreground">
            Kelola profil toko, avatar, dan foto sampul Anda.
          </p>
        </div>
        
        <PengaturanClient user={user as any} />
      </div>
    );
}
