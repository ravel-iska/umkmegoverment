"use client";

import { useState } from "react";
import { Package, Trash2, Image as ImageIcon, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { deleteProductAdmin } from "../actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductRecord {
  id: string;
  name: string;
  price: number;
  sellerName: string;
  categoryName: string;
  stock: number;
  image: string | null;
}

export function ProductClient({ initialProducts }: { initialProducts: ProductRecord[] }) {
  const [products, setProducts] = useState<ProductRecord[]>(initialProducts);
  const [isPending, setIsPending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setIsPending(true);
    try {
      const result = await deleteProductAdmin(id);
      if (result.success) {
        setProducts(products.filter(p => p.id !== id));
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" /> Moderasi Produk
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {["Nama Produk", "Penjual", "Kategori", "Harga", "Stok", "Aksi"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium flex items-center gap-3">
                  <div 
                    className="relative w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0 border cursor-pointer group"
                    onClick={() => p.image && setSelectedImage(p.image)}
                    title={p.image ? "Perbesar Gambar" : "Tidak ada gambar"}
                  >
                    {p.image ? (
                      <>
                        <Image src={p.image} alt={p.name} fill className="object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="text-white w-4 h-4" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <span className="truncate max-w-[200px]" title={p.name}>{p.name}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.sellerName}</td>
                <td className="px-4 py-3">
                  <span className="bg-muted px-2 py-1 rounded-md text-xs">{p.categoryName}</span>
                </td>
                <td className="px-4 py-3 text-emerald-600 font-medium">Rp {p.price.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    className="h-8 flex items-center gap-1"
                    onClick={() => handleDeleteProduct(p.id)}
                  >
                    <Trash2 className="h-3 w-3" /> Hapus
                  </Button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada produk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pratinjau Gambar Produk</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden mt-2 border">
            {selectedImage && (
              <Image 
                src={selectedImage} 
                alt="Pratinjau Produk" 
                fill 
                className="object-contain"
                sizes="(max-w-768px) 100vw, 800px" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
