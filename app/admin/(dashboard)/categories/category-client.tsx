"use client";

import { useState } from "react";
import { Tags, Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addCategory, updateCategory, deleteCategory } from "./actions";

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  productCount: number;
}

const COLOR_OPTIONS = [
  { label: "Hijau", value: "bg-emerald-100 text-emerald-700" },
  { label: "Biru", value: "bg-blue-100 text-blue-700" },
  { label: "Merah", value: "bg-red-100 text-red-700" },
  { label: "Kuning", value: "bg-amber-100 text-amber-700" },
  { label: "Ungu", value: "bg-purple-100 text-purple-700" },
  { label: "Oranye", value: "bg-orange-100 text-orange-700" },
  { label: "Pink", value: "bg-pink-100 text-pink-700" },
  { label: "Abu-abu", value: "bg-gray-100 text-gray-700" },
];

const ICON_OPTIONS = ["🛒", "🍜", "👗", "💄", "🪑", "📦", "🌿", "🎨", "🔧", "🧴", "👜", "🏠", "📱", "🍰", "🌾"];

export function CategoryClient({ initialCategories }: { initialCategories: CategoryRecord[] }) {
  const [categories, setCategories] = useState<CategoryRecord[]>(initialCategories);
  const [isPending, setIsPending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryRecord | null>(null);
  const [selectedIcon, setSelectedIcon] = useState("📦");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("icon", selectedIcon);
      formData.set("color", selectedColor);

      if (editingCat) {
        await updateCategory(editingCat.id, formData);
        setCategories(
          categories.map((c) =>
            c.id === editingCat.id
              ? {
                  ...c,
                  name: formData.get("name") as string,
                  description: formData.get("description") as string,
                  icon: selectedIcon,
                  color: selectedColor,
                  slug: (formData.get("name") as string)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, ""),
                }
              : c
          )
        );
        setShowModal(false);
        setEditingCat(null);
      } else {
        await addCategory(formData);
        window.location.reload();
        return;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: string, productCount: number) => {
    if (productCount > 0) {
      alert("Tidak dapat menghapus kategori yang masih memiliki produk.");
      return;
    }
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    setIsPending(true);
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const openAddModal = () => {
    setEditingCat(null);
    setSelectedIcon("📦");
    setSelectedColor(COLOR_OPTIONS[0].value);
    setShowModal(true);
  };

  const openEditModal = (cat: CategoryRecord) => {
    setEditingCat(cat);
    setSelectedIcon(cat.icon || "📦");
    setSelectedColor(cat.color || COLOR_OPTIONS[0].value);
    setShowModal(true);
  };

  return (
    <>
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Tags className="h-5 w-5" /> Kelola Kategori
          </h2>
          <Button onClick={openAddModal} className="h-9 gap-2">
            <Plus className="h-4 w-4" /> Tambah Kategori
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Icon", "Nama Kategori", "Slug", "Warna", "Deskripsi", "Jumlah Produk", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-2xl">{c.icon || "📦"}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.color || "bg-gray-100 text-gray-700"}`}>
                      {COLOR_OPTIONS.find((o) => o.value === c.color)?.label || "Default"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{c.description || "-"}</td>
                  <td className="px-4 py-3 font-medium">{c.productCount} Produk</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => openEditModal(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        disabled={isPending || c.productCount > 0}
                        onClick={() => handleDelete(c.id, c.productCount)}
                        title={c.productCount > 0 ? "Kategori tidak bisa dihapus" : "Hapus Kategori"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Belum ada kategori.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/30">
              <h3 className="font-semibold text-lg">{editingCat ? "Edit Kategori" : "Tambah Kategori Baru"}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Nama */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Kategori <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingCat?.name || ""}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  placeholder="Misal: Pakaian, Makanan, dsb"
                />
              </div>

              {/* Pilih Icon */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`text-2xl w-11 h-11 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedIcon === icon
                          ? "border-primary bg-primary/10 scale-110"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Terpilih: <span className="text-xl">{selectedIcon}</span></p>
              </div>

              {/* Pilih Warna */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Warna Label</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedColor(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${opt.value} ${
                        selectedColor === opt.value ? "border-foreground scale-105" : "border-transparent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Deskripsi (Opsional)</label>
                <textarea
                  name="description"
                  defaultValue={editingCat?.description || ""}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background min-h-[80px] resize-none"
                  placeholder="Deskripsi singkat tentang kategori ini..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={isPending}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Menyimpan..." : editingCat ? "Simpan Perubahan" : "Tambah Kategori"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
