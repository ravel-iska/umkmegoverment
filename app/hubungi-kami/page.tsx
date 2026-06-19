import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Hubungi Kami — Pasar Podosari",
  description: "Hubungi tim Pasar Podosari untuk pertanyaan, saran, atau kerjasama.",
};

// Halaman statis — hanya form yang client, sisanya sudah di-prerender
export const revalidate = false;

const contactInfo = [
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Alamat",
    lines: [
      "Desa Podosari, Kecamatan Podosari",
      "Kabupaten Pringsewu, Lampung",
      "54212",
    ],
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: "Telepon",
    lines: ["Telepon: (0275) 123-4567", "+62 812-3456-7890"],
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: "E-mail",
    lines: ["info@pasarpodosari.id", "support@pasarpodosari.id"],
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Jam Operasional",
    lines: ["Senin - Sabtu: 08.00 - 17.00 WIB", "Minggu: Libur"],
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Hubungi Kami</h1>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info — Server Rendered, 0ms */}
            <div>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="bg-card p-6 rounded-xl border flex items-start gap-4"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{info.title}</h3>
                      {info.lines.map((line, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form — Client Component, hanya dimuat saat dibutuhkan */}
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
