"use client";

import { useState } from "react";
import {
  Package, Plus, Pencil, Trash2, AlertCircle, Loader2,
  Search, Filter, Star, TrendingUp, CheckCircle2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProduct, updateProduct, deleteProduct } from "../actions";

interface Product {
  id: string; nama: string; harga: number; stok: number; terjual: number;
  rating: number; kategori: string; categoryId: string; deskripsi: string;
  image?: string | null; featured: boolean;
}

interface ProductForm {
  id?: string; nama: string; harga: string; stok: string;
  categoryId: string; deskripsi: string; image: string;
  images: string[]; video: string;
}

const emptyForm: ProductForm = { nama: "", harga: "", stok: "", categoryId: "", deskripsi: "", image: "", images: [], video: "" };

export function ProdukClient({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: { id: string; name: string }[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchKategori = filterKategori ? p.categoryId === filterKategori : true;
    return matchSearch && matchKategori;
  });

  const handleSave = async () => {
    if (!form.nama || !form.harga || !form.categoryId) {
      showToast("Nama, harga, dan kategori wajib diisi!", "error");
      return;
    }
    setIsPending(true);
    try {
      if (form.id) {
        await updateProduct(form.id, {
          name: form.nama, price: Number(form.harga),
          stock: Number(form.stok), categoryId: form.categoryId, description: form.deskripsi,
          image: form.image, images: JSON.stringify(form.images), video: form.video,
        });
        showToast("Produk berhasil diperbarui!");
      } else {
        await createProduct({
          name: form.nama, price: Number(form.harga),
          stock: Number(form.stok), categoryId: form.categoryId, description: form.deskripsi,
          image: form.image, images: JSON.stringify(form.images), video: form.video,
        });
        showToast("Produk berhasil ditambahkan!");
      }
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      showToast("Terjadi kesalahan, coba lagi.", "error");
    } finally {
      setIsPending(false);
    }
  };

  const handleEdit = (p: any) => {
    let parsedImages = [];
    try {
      if (p.images) parsedImages = JSON.parse(p.images);
    } catch(e) {}
    setForm({ id: p.id, nama: p.nama, harga: String(p.harga), stok: String(p.stok), categoryId: p.categoryId, deskripsi: p.deskripsi, image: p.image || "", images: parsedImages, video: p.video || "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "main" | "additional" | "video") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (type === "additional" && form.images.length + files.length > 5) {
      showToast("Maksimal 5 foto tambahan diperbolehkan", "error");
      return;
    }

    setIsUploading(true);
    try {
      if (type === "additional") {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (res.ok && data.url) uploadedUrls.push(data.url);
        }
        setForm({ ...form, images: [...form.images, ...uploadedUrls] });
        showToast(`${uploadedUrls.length} foto tambahan berhasil diunggah!`);
      } else {
        const file = files[0];
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload gagal");
        const data = await res.json();
        
        if (type === "video") {
          setForm({ ...form, video: data.url });
          showToast("Video berhasil diunggah!");
        } else {
          setForm({ ...form, image: data.url });
          showToast("Foto utama berhasil diunggah!");
        }
      }
    } catch (error) {
      showToast("Gagal mengunggah file.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    setIsPending(true);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Produk berhasil dihapus!");
    } catch {
      showToast("Gagal menghapus produk.", "error");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-2">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600" /> Produk Saya
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} produk terdaftar</p>
        </div>
        <Button
          onClick={() => { setForm(emptyForm); setShowForm(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Tambah Produk
        </Button>
      </div>

      {/* Form Tambah / Edit */}
      {showForm && (
        <div className="bg-card rounded-xl border p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">{form.id ? "✏️ Edit Produk" : "➕ Tambah Produk Baru"}</h2>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nama Produk <span className="text-red-500">*</span></label>
              <Input placeholder="Contoh: Tempe Mendoan" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Harga (Rp) <span className="text-red-500">*</span></label>
              <Input type="number" placeholder="5000" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Stok</label>
              <Input type="number" placeholder="50" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Kategori <span className="text-red-500">*</span></label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Pilih Kategori...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Foto Utama Produk <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-4">
                {form.image && (
                  <img src={form.image} alt="Preview" className="h-16 w-16 object-cover rounded border" />
                )}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "main")} disabled={isUploading} className="cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Foto Tambahan (Maks 5, Opsional)</label>
              <div className="flex flex-wrap items-center gap-4">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative h-16 w-16 group">
                    <img src={img} alt={`Additional ${idx}`} className="h-16 w-16 object-cover rounded border" />
                    <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                {form.images.length < 5 && (
                  <div className="flex-1 min-w-[200px]">
                    <Input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, "additional")} disabled={isUploading} className="cursor-pointer" />
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Video Produk (Opsional)</label>
              <div className="flex items-center gap-4">
                {form.video && (
                  <div className="relative h-16 w-24 group rounded border overflow-hidden bg-black flex items-center justify-center">
                    <video src={form.video} className="h-full w-full object-cover opacity-50" />
                    <button type="button" onClick={() => setForm({ ...form, video: "" })} className="absolute z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                )}
                <div className="flex-1">
                  <Input type="file" accept="video/*" onChange={(e) => handleImageUpload(e, "video")} disabled={isUploading} className="cursor-pointer" />
                  <p className="text-xs text-muted-foreground mt-1">Disarankan durasi pendek. Maksimal 10MB.</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Deskripsi</label>
              <textarea
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Deskripsi singkat produk..."
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <Button
              disabled={isPending}
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {form.id ? "Simpan Perubahan" : "Tambahkan Produk"}
            </Button>
            <Button variant="outline" disabled={isPending} onClick={() => { setShowForm(false); setForm(emptyForm); }}>
              Batal
            </Button>
          </div>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama produk..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Daftar Produk</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} dari {products.length} produk</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-30" />
            <p className="font-medium">Tidak ada produk ditemukan</p>
            <p className="text-xs mt-1">Coba ubah kata kunci pencarian atau tambah produk baru</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {["Nama Produk", "Kategori", "Harga", "Stok", "Terjual", "Rating", "Aksi"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-3 flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.nama} className="h-10 w-10 object-cover rounded" />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground opacity-50" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{p.nama}</p>
                        {p.stok < 5 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${p.stok === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                            {p.stok === 0 ? "Habis" : "Stok Menipis"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{p.kategori}</span>
                    </td>
                    <td className="px-4 py-3 font-medium">Rp {p.harga?.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3">
                      <span className={p.stok < 5 ? "text-red-600 font-semibold" : ""}>{p.stok}</span>
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{p.terjual}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-amber-500 font-medium">
                        <Star className="h-3.5 w-3.5 fill-amber-400" /> {p.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-emerald-600" onClick={() => handleEdit(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" disabled={isPending} onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
