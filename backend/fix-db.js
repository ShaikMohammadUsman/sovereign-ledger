const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDb() {
  try {
    const deletedCount = await prisma.request.deleteMany();
    console.log('Successfully deleted', deletedCount.count, 'broken request records.');
    console.log('You can now create a fresh request with your real login session.');
  } catch (err) {
    console.error('Error fixing DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fixDb();
