import { Truck, Shield, Clock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <Truck className="h-5 w-5 sm:h-6 sm:w-6" />,
    title: "Pengiriman Cepat",
    description: "Produk dikirim langsung dari Desa Podosari",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <Shield className="h-5 w-5 sm:h-6 sm:w-6" />,
    title: "Produk Berkualitas",
    description: "Jaminan kualitas produk lokal terbaik",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" />,
    title: "Layanan 24/7",
    description: "Dukungan pelanggan setiap saat",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />,
    title: "Pembayaran Aman",
    description: "Transaksi aman dan terpercaya",
    color: "bg-purple-50 text-purple-600",
  },
];

function FeatureItem({
  feature,
  delay,
}: {
  feature: (typeof features)[0];
  delay: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 sm:gap-4 p-3 sm:p-0 rounded-xl sm:rounded-none",
        "bg-background sm:bg-transparent border sm:border-0",
        "transition-all duration-500 hover:shadow-sm sm:hover:shadow-none",
        "animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      )}
      style={{ animationDelay: `${delay}ms`, animationDuration: "500ms" }}
    >
      <div
        className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0",
          feature.color
        )}
      >
        {feature.icon}
      </div>
      <div>
        <h3 className="font-semibold text-xs sm:text-sm">{feature.title}</h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{feature.description}</p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 border-t">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {features.map((feature, i) => (
            <FeatureItem key={i} feature={feature} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
