const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  console.log("Chat data deleted");
}

main().finally(() => prisma.$disconnect());
