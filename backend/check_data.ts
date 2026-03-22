import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const requests = await prisma.request.findMany({ where: { status: 'APPROVED' } });
  console.log(`Total APPROVED requests: ${requests.length}`);
  const sum = await prisma.request.aggregate({ _sum: { amount: true }, where: { status: 'APPROVED' } });
  console.log(`Total APPROVED amount: ${sum._sum.amount}`);
  const vendors = await prisma.vendor.findMany();
  console.log(`Total vendors: ${vendors.length}`);
}
main();
