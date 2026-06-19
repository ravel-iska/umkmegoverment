const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai melakukan seeding data UMKM...");

  const defaultPassword = await bcrypt.hash("password123", 10);

  // Pastikan ada setidaknya satu kategori "Makanan & Minuman" dan "Kerajinan"
  let catMakanan = await prisma.category.findFirst({ where: { name: 'Makanan & Minuman' } });
  if (!catMakanan) {
    catMakanan = await prisma.category.create({
      data: { name: 'Makanan & Minuman', slug: 'makanan-minuman' }
    });
  }

  let catKerajinan = await prisma.category.findFirst({ where: { name: 'Kerajinan' } });
  if (!catKerajinan) {
    catKerajinan = await prisma.category.create({
      data: { name: 'Kerajinan', slug: 'kerajinan' }
    });
  }

  const umkmData = [
    {
      name: "Toko Mas Iwan",
      email: "mas.iwan@example.com",
      phone: "087893309253",
      address: "Jln. Kh ghalib raya",
      products: [
        {
          name: "Degan Jelly AA",
          price: 10000,
          description: "Minuman segar Degan Jelly khas buatan Mas Iwan.",
          category: catMakanan.id
        }
      ]
    },
    {
      name: "Es Dawet & Rujak Mas Cahyo",
      email: "mas.cahyo@example.com",
      phone: "080000000001",
      address: "Jln. Surorejo kec. Pringsewu rt.04 rw.02",
      products: [
        {
          name: "Es Dawet",
          price: 5000,
          description: "Es dawet segar mas Cahyo. Telah berjualan selama 3 tahun.",
          category: catMakanan.id
        },
        {
          name: "Rujak Bubuk",
          price: 10000,
          description: "Rujak bubuk khas.",
          category: catMakanan.id
        },
        {
          name: "Rujak Petisan",
          price: 15000,
          description: "Rujak petisan mantap. Resep telah bertahan 8 tahun.",
          category: catMakanan.id
        }
      ]
    },
    {
      name: "Sate Ayam Wiwik Sundari",
      email: "wiwik.sundari@example.com",
      phone: "080000000002",
      address: "Jln. Surorejo kec. Pringsewu rt.02 rw.02",
      products: [
        {
          name: "Sate Ayam Lontong/Nasi (8 Tusuk)",
          price: 10000,
          description: "Sate seporsi isi 8 tusuk lengkap dengan pilihan lontong atau nasi.",
          category: catMakanan.id
        },
        {
          name: "Sate Ayam Tanpa Lontong (10 Tusuk)",
          price: 10000,
          description: "Sate seporsi tanpa lontong/nasi, isi 10 tusuk full daging ayam pilihan.",
          category: catMakanan.id
        }
      ]
    },
    {
      name: "Pengrajin Tempe Bpk Bambang",
      email: "bambang.suanto@example.com",
      phone: "080000000003",
      address: "jln Surorejo kec. Pringsewu rt.02 rw 02",
      products: [
        {
          name: "Tempe Mentah (140 gram)",
          price: 1500,
          description: "Tempe segar buatan langsung oleh pengrajin tempe Bapak Bambang Suanto. Harga tertera adalah per kemasan dengan berat 140 gram.",
          category: catMakanan.id
        }
      ]
    },
    {
      name: "Perhiasan Perak Pak Muji",
      email: "pak.muji@example.com",
      phone: "081367136375",
      address: "jln. Diageng kurniawan rt.02. Rw.02q",
      products: [
        {
          name: "Perhiasan Perak (Harga per gram)",
          price: 60000,
          description: "Kerajinan perhiasan perak murni hasil karya Pak Muji. Harga yang tertera adalah harga per gram. Silakan hubungi penjual untuk custom desain.",
          category: catKerajinan.id
        }
      ]
    }
  ];

  for (const umkm of umkmData) {
    // Upsert User (supaya tidak error jika dirun berkali-kali)
    let user = await prisma.user.findUnique({ where: { email: umkm.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: umkm.name,
          email: umkm.email,
          password: defaultPassword,
          role: "Penjual",
          phone: umkm.phone,
          address: umkm.address,
          isVerified: true,
          verificationStatus: "Verified"
        }
      });
      console.log(`✅ Toko dibuat: ${user.name}`);
    } else {
      // Pastikan status verifikasi diperbarui
      user = await prisma.user.update({
        where: { email: umkm.email },
        data: {
          isVerified: true,
          verificationStatus: "Verified"
        }
      });
      console.log(`⚠️ Toko diperbarui (Verified): ${user.name}`);
    }

    // Insert Products
    for (const prod of umkm.products) {
      const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
      
      await prisma.product.create({
        data: {
          name: prod.name,
          slug: slug,
          price: prod.price,
          description: prod.description,
          stock: 99, // default stock
          categoryId: prod.category,
          sellerId: user.id,
          image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000" // Placeholder
        }
      });
      console.log(`   📦 Produk dibuat: ${prod.name}`);
    }
  }

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
