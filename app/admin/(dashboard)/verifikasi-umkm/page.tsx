import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function VerifikasiUmkmPage() {
  const session = await getSession("admin_session");
  
  if (!session || session.role !== "Admin") {
    redirect("/admin/login");
  }

  const pendingUsers = await db.user.findMany({
    where: {
      role: "Penjual",
      verificationStatus: "Pending"
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      ktpProof: true,
      productProof: true,
      productDescription: true,
      verificationStatus: true,
      createdAt: true
    }
  });

  const serialized = pendingUsers.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Verifikasi UMKM</h1>
        <p className="text-muted-foreground mt-1">
          Tinjau dan setujui pendaftaran penjual baru di platform.
        </p>
      </div>

      {serialized.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium text-foreground mb-1">Tidak Ada Antrean</p>
          <p className="text-sm">Semua UMKM yang mendaftar sudah selesai ditinjau.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {serialized.map((user) => (
            <div key={user.id} className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      Menunggu Tinjauan
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.email} • {user.phone || "Tidak ada nomor"}
                  </p>
                </div>

                {/* Documents */}
                <div className="flex gap-4">
                  <div className="w-40">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Foto KTP</p>
                    <div className="aspect-video bg-muted rounded-xl overflow-hidden border relative group">
                      {user.ktpProof ? (
                        <a href={user.ktpProof} target="_blank" rel="noreferrer" className="block w-full h-full">
                          <img src={user.ktpProof} alt="KTP" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                            Perbesar
                          </div>
                        </a>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Tidak ada</div>
                      )}
                    </div>
                  </div>
                  <div className="w-40">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Foto Produk</p>
                    <div className="aspect-video bg-muted rounded-xl overflow-hidden border relative group">
                      {user.productProof ? (
                        <a href={user.productProof} target="_blank" rel="noreferrer" className="block w-full h-full">
                          <img src={user.productProof} alt="Produk" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                            Perbesar
                          </div>
                        </a>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Tidak ada</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Deskripsi Produk */}
              {user.productDescription && (
                <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-dashed">
                  <h4 className="font-semibold text-sm mb-2 text-emerald-800">Deskripsi Sampel Produk</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{user.productDescription}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t justify-end">
                <form action={`/api/admin/verify-umkm`} method="POST">
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="action" value="Reject" />
                  <button type="submit" className="w-full sm:w-auto px-6 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    ✕ Tolak
                  </button>
                </form>
                <form action={`/api/admin/verify-umkm`} method="POST">
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="action" value="Approve" />
                  <button type="submit" className="w-full sm:w-auto px-6 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm">
                    ✓ Setujui Pendaftaran
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
