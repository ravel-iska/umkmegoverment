export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  seller: string;
  rating: number;
  sold: number;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Makanan & Minuman",
    slug: "makanan-minuman",
    description: "Kuliner khas desa",
    icon: "food",
    color: "bg-orange-50",
  },
  {
    id: "2",
    name: "Kerajinan Tangan",
    slug: "kerajinan-tangan",
    description: "Karya seni lokal",
    icon: "craft",
    color: "bg-purple-50",
  },
  {
    id: "3",
    name: "Fesyen",
    slug: "fesyen",
    description: "Busana & aksesori",
    icon: "fashion",
    color: "bg-pink-50",
  },
  {
    id: "4",
    name: "Pertanian",
    slug: "pertanian",
    description: "Hasil kebun segar",
    icon: "agriculture",
    color: "bg-green-50",
  },
  {
    id: "5",
    name: "Jasa Lokal",
    slug: "jasa-lokal",
    description: "Layanan terpercaya",
    icon: "service",
    color: "bg-slate-100",
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Keripik Tempe Khas Podosari",
    slug: "keripik-tempe-khas-podosari",
    description: "Keripik tempe renyah dengan bumbu khas Podosari yang gurih dan lezat.",
    price: 25000,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cuplikan%20layar%202025-12-06%20080148-wSNb7wuiRrQ7VBdPs7D7xNAA3EAjnV.png",
    category: "makanan-minuman",
    seller: "Warung Bu Siti",
    rating: 4.8,
    sold: 150,
    featured: true,
  },
  {
    id: "2",
    name: "Batik Tulis Podosari Motif Parang",
    slug: "batik-tulis-podosari-motif-parang",
    description: "Batik tulis asli Podosari dengan motif parang klasik.",
    price: 350000,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cuplikan%20layar%202025-12-06%20080148-wSNb7wuiRrQ7VBdPs7D7xNAA3EAjnV.png",
    category: "fesyen",
    seller: "Batik Ayu Podosari",
    rating: 4.9,
    sold: 80,
    featured: true,
  },
  {
    id: "3",
    name: "Anyaman Bambu Keranjang Tradisional",
    slug: "anyaman-bambu-keranjang-tradisional",
    description: "Keranjang anyaman bambu tradisional buatan tangan pengrajin lokal.",
    price: 75000,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cuplikan%20layar%202025-12-06%20080148-wSNb7wuiRrQ7VBdPs7D7xNAA3EAjnV.png",
    category: "kerajinan-tangan",
    seller: "Kerajinan Pak Darto",
    rating: 4.7,
    sold: 120,
    featured: true,
  },
  {
    id: "4",
    name: "Gula Merah Kelapa Organik",
    slug: "gula-merah-kelapa-organik",
    description: "Gula merah kelapa organik murni tanpa bahan pengawet.",
    price: 35000,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cuplikan%20layar%202025-12-06%20080148-wSNb7wuiRrQ7VBdPs7D7xNAA3EAjnV.png",
    category: "pertanian",
    seller: "Tani Makmur Podosari",
    rating: 4.9,
    sold: 250,
    featured: true,
  },
  {
    id: "5",
    name: "Sambal Terasi Bu Darmi",
    slug: "sambal-terasi-bu-darmi",
    description: "Sambal terasi pedas dengan resep turun temurun.",
    price: 20000,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cuplikan%20layar%202025-12-06%20080148-wSNb7wuiRrQ7VBdPs7D7xNAA3EAjnV.png",
    category: "makanan-minuman",
    seller: "Dapur Bu Darmi",
    rating: 4.6,
    sold: 180,
    featured: false,
  },
  {
    id: "6",
    name: "Tas Anyaman Pandan",
    slug: "tas-anyaman-pandan",
    description: "Tas cantik dari anyaman daun pandan berkualitas.",
    price: 125000,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cuplikan%20layar%202025-12-06%20080148-wSNb7wuiRrQ7VBdPs7D7xNAA3EAjnV.png",
    category: "kerajinan-tangan",
    seller: "Kerajinan Ibu Ani",
    rating: 4.8,
    sold: 95,
    featured: true,
  },
  {
    id: "7",
    name: "Kopi Robusta Podosari",
    slug: "kopi-robusta-podosari",
    description: "Kopi robusta pilihan dari kebun lokal Podosari.",
    price: 55000,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cuplikan%20layar%202025-12-06%20080148-wSNb7wuiRrQ7VBdPs7D7xNAA3EAjnV.png",
    category: "makanan-minuman",
    seller: "Kopi Nusantara",
    rating: 4.7,
    sold: 200,
    featured: false,
  },
  {
    id: "8",
    name: "Beras Merah Organik",
    slug: "beras-merah-organik",
    description: "Beras merah organik sehat dari sawah Podosari.",
    price: 85000,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cuplikan%20layar%202025-12-06%20080148-wSNb7wuiRrQ7VBdPs7D7xNAA3EAjnV.png",
    category: "pertanian",
    seller: "Tani Makmur Podosari",
    rating: 4.8,
    sold: 130,
    featured: true,
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
