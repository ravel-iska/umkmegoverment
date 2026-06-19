import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { SellerSidebar } from "./sidebar";
import { db } from "@/lib/db";
import { VerificationGate } from "@/components/seller/verification-gate";

export default async function KelolaTokoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || (session.role !== "Penjual" && session.role !== "Admin")) {
    redirect("/login");
  }

  // Ambil data user terbaru dari DB untuk mengecek status verifikasi
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, verificationStatus: true, role: true, isBlocked: true }
  });

  if (!user || user.isBlocked) {
    redirect("/login");
  }

  // Bypass verifikasi jika dia adalah Admin yang sedang melihat dashboard toko
  if (user.role === "Admin") {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
        <SellerSidebar userName={session.name} role={session.role} />
        <main className="flex-1 p-6 transition-all overflow-x-hidden md:min-w-0">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      <SellerSidebar userName={session.name} role={session.role} />
      <main className="flex-1 p-6 transition-all overflow-x-hidden md:min-w-0">
        <VerificationGate user={user as any}>
          {children}
        </VerificationGate>
      </main>
    </div>
  );
}
