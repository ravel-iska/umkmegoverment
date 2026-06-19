const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  
  await prisma.user.updateMany({
    where: { email: 'admin@pasarpodosari.id' },
    data: { password: hash }
  });
  
  await prisma.user.updateMany({
    where: { email: 'warungbusiti@example.com' },
    data: { password: hash }
  });

  console.log("Passwords updated to 'password123'");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
