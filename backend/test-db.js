const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users:", users.length);
    const requests = await prisma.request.findMany();
    console.log("Requests:", requests.length);
  } catch (error) {
    console.error("DB Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
