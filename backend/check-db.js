const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  try {
    const users = await prisma.user.findMany();
    const vendors = await prisma.vendor.findMany();
    const requests = await prisma.request.findMany({
      include: { vendor: true, createdBy: true }
    });
    
    console.log('--- DB SUMMARY ---');
    console.log('Users count:', users.length);
    console.log('Vendors count:', vendors.length);
    console.log('Requests count:', requests.length);
    
    if (requests.length > 0) {
      console.log('First Request:', JSON.stringify(requests[0], null, 2));
    }
  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
