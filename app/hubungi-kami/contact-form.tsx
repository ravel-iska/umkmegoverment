"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="bg-card p-6 md:p-8 rounded-xl border">
      <h2 className="text-2xl font-bold mb-6">Kirim Pesan</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Nama Lengkap</label>
            <Input
              placeholder="Masukkan nama Anda"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">E-mail</label>
            <Input
              type="email"
              placeholder="email@contoh.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Subjek</label>
          <Input
            placeholder="Tentang apa pesan Anda?"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Pesan</label>
          <Textarea
            placeholder="Tulis pesan Anda di sini..."
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isSubmitting}
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
        </Button>
      </form>
    </div>
  );
}
