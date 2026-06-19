import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession("admin_session");
  
  if (!session || session.role !== "Admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      {/* Sidebar */}
      <AdminSidebar userName={session.name} />

      {/* Main Content */}
      <main className="flex-1 p-6 transition-all overflow-x-hidden md:min-w-0">
        {children}
      </main>
    </div>
  );
}
