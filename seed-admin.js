const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminEmail = "admin@pasarpodosari.id"
  const adminPassword = "admin123"
  
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "Admin" }
  })
  
  if (existingAdmin) {
    console.log("Admin account already exists:", existingAdmin.email)
    return
  }
  
  const hashedPassword = bcrypt.hashSync(adminPassword, 10)
  
  const admin = await prisma.user.create({
    data: {
      name: "Admin Utama",
      email: adminEmail,
      password: hashedPassword,
      role: "Admin",
      isVerified: true
    }
  })
  
  console.log("Admin account created successfully:", admin.email)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
