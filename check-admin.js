const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function main() {
  const admin = await p.user.findFirst({ where: { role: 'Admin' }, select: { email: true, password: true } });
  console.log("Admin:", admin);
  if (admin && admin.password) {
    const match = bcrypt.compareSync("admin123", admin.password);
    console.log("Password 'admin123' match:", match);
  }
}

main().finally(() => p.$disconnect());
