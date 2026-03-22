import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sovereign.com' },
    update: {},
    create: {
      email: 'admin@sovereign.com',
      name: 'Chief Procurer',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'Procurement Strategy'
    }
  });

  // Create Vendors
  const vendors = [
    { name: 'TechNova Solutions', contact: 'John Tech', email: 'sales@technova.com', category: 'Hardware', paymentTerms: 'Net 30', status: 'ACTIVE' },
    { name: 'Global Logistics', contact: 'Sam Porter', email: 'info@globallog.com', category: 'Logistics', paymentTerms: 'Net 15', status: 'ACTIVE' },
    { name: 'Office Depot', contact: 'Alice Office', email: 'support@officedepot.com', category: 'Supplies', paymentTerms: 'Due on Receipt', status: 'ACTIVE' }
  ];

  for (const v of vendors) {
    await prisma.vendor.create({ data: v });
  }

  console.log('Seeding complete! Admin: admin@sovereign.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
