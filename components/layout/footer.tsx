import Link from "next/link";
import { Store, MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer>
      {/* CTA Section */}
      <section className="bg-primary py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Punya Produk Lokal untuk Dijual?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            apalagi dengan ratusan UMKM lainnya di Desa Podosari. Jangkau lebih banyak
            pembeli dan kembangkan bisnis Anda bersama kami.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8"
            >
              Daftar Sebagai Penjual
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer Links */}
      <div className="bg-[#1a3d2e] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Pasar Podosari</h3>
                <p className="text-xs text-primary">Marketplace Desa</p>
              </div>
            </Link>
            <p className="text-white/70 text-sm">
              Platform pasar untuk mendukung produk lokal UMKM Desa Podosari, Lampung.
            </p>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-semibold mb-4">Menu</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/produk" className="hover:text-white transition-colors">
                  Produk
                </Link>
              </li>
              <li>
                <Link href="/tentang-kami" className="hover:text-white transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/hubungi-kami" className="hover:text-white transition-colors">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h4 className="font-semibold mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Tanya Jawab Umum
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-pink-400" />
                <span>Desa Podosari, Lampung</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@pasarpodosari.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Telepon (0275) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/60">
          <p>
            &copy; 2024 Pasar Podosari. Dibuat dengan{" "}
            <span className="text-red-400">&#9829;</span> untuk UMKM Desa Podosari
          </p>
        </div>
      </div>
    </footer>
  );
}
