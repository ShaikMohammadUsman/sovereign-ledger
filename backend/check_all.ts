import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const allReqs = await prisma.request.findMany({ include: { vendor: true } });
  console.log(`Total ANY requests: ${allReqs.length}`);
  allReqs.forEach(r => console.log(` - ID: ${r.id}, Amount: ${r.amount}, Status: ${r.status}, Vendor: ${r.vendor?.name}`));
}
main();
