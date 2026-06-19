import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Users, Target, Heart, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami — Pasar Podosari",
  description: "Kisah dan nilai-nilai di balik Pasar Podosari, platform marketplace UMKM Desa Podosari.",
};

// Halaman statis — tidak ada DB query, build sekali selesai
export const revalidate = false;

const values = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Pemberdayaan UMKM",
    description:
      "Membantu pelaku usaha mikro, kecil, dan menengah untuk berkembang.",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Kualitas Terjamin",
    description:
      "Setiap produk melewati kurasi untuk menjamin kualitas terbaik.",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Kearifan Lokal",
    description: "Melestarikan budaya dan tradisi melalui produk lokal.",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Kepercayaan",
    description: "Membangun kepercayaan antara penjual dan pembeli.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-emerald-900/60 z-10" />
          <Image 
            src="/images/sampul-desa.jpeg" 
            alt="Pemandangan Desa Podosari" 
            fill 
            className="object-cover"
          />
          <div className="relative z-20 max-w-4xl mx-auto text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Tentang Pasar Podosari
            </h1>
            <p className="text-lg text-emerald-50 max-w-2xl mx-auto">
              Platform marketplace digital yang didedikasikan untuk memberdayakan
              UMKM dan mengangkat produk-produk lokal Desa Podosari ke panggung
              nasional.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=900"
                  alt="Volunteer di Podosari"
                  fill
                  priority={true}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Cerita Kami
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Pasar Podosari lahir dari keinginan untuk membantu para pelaku
                    UMKM di Desa Podosari, Lampung, dalam memasarkan
                    produk-produk unggulan mereka ke pasar yang lebih luas.
                  </p>
                  <p>
                    Dengan memanfaatkan teknologi digital, kami membangun jembatan
                    antara pengrajin lokal dengan pembeli dari seluruh Indonesia.
                    Setiap transaksi di platform ini berkontribusi langsung pada
                    perekonomian desa.
                  </p>
                  <p>
                    Kami percaya bahwa produk lokal memiliki nilai dan keunikan
                    tersendiri yang layak diapresiasi. Dari makanan tradisional
                    hingga kerajinan tangan, setiap produk memiliki cerita dan
                    dedikasi dari para pembuatnya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Nilai-Nilai Kami
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Prinsip yang mendasari setiap langkah kami dalam membangun
                ekosistem marketplace desa yang berkelanjutan.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-xl border hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  50+
                </p>
                <p className="text-muted-foreground">Penjual Aktif</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  200+
                </p>
                <p className="text-muted-foreground">Produk Lokal</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  1000+
                </p>
                <p className="text-muted-foreground">Pembeli Puas</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  5
                </p>
                <p className="text-muted-foreground">Kategori Produk</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
