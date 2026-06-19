import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";
import { Users, Sprout, Store, Landmark, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Desa — Pasar Podosari",
  description: "Kenali lebih dekat Profil Desa dan Visi Misi Pasar UMKM Podosari.",
};

export default function ProfilDesaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-emerald-900/40 z-10" />
          <Image 
            src="/images/sampul-desa.jpeg" 
            alt="Pemandangan Desa Podosari" 
            fill 
            className="object-cover"
          />
          <div className="relative z-20 text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Profil Desa Podosari</h1>
            <p className="text-lg md:text-xl text-emerald-50 max-w-2xl mx-auto">
              Membangun ekonomi kreatif dan memberdayakan UMKM lokal melalui digitalisasi pasar tradisional.
            </p>
          </div>
        </section>

        {/* Sejarah & Visi Misi */}
        <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Landmark className="h-8 w-8 text-emerald-600" />
                Sejarah Singkat
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Podosari adalah sebuah kecamatan di Kabupaten Pringsewu, Lampung yang dikenal dengan potensi pertanian dan kerajinan tangan khasnya. Seiring dengan perkembangan zaman, masyarakat Podosari terus beradaptasi dengan teknologi.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Pasar UMKM Podosari hadir sebagai inisiatif digital (berbentuk <em>e-commerce</em>) yang dipelopori oleh pemuda dan pemerintah setempat untuk menjembatani para pelaku Usaha Mikro Kecil Menengah (UMKM) lokal dengan pasar yang lebih luas di seluruh Indonesia.
              </p>
              
              <a 
                href="https://podosari-pringsewu.desa.id/pemerintah" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium rounded-lg transition-colors border border-emerald-200"
              >
                Kunjungi Website Resmi Desa
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border shadow-sm">
              <h3 className="text-2xl font-bold text-emerald-700 mb-6">Visi & Misi</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Menumbuhkan Ekonomi</h4>
                    <p className="text-sm text-muted-foreground mt-1">Mendorong pertumbuhan ekonomi desa secara mandiri dan berkelanjutan.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Digitalisasi UMKM</h4>
                    <p className="text-sm text-muted-foreground mt-1">Memberikan ruang etalase digital bagi pedagang dan perajin lokal.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Kesejahteraan Bersama</h4>
                    <p className="text-sm text-muted-foreground mt-1">Meningkatkan kesejahteraan masyarakat melalui prinsip gotong royong.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
