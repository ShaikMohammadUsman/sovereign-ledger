import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const organization = await prisma.organization.upsert({
    where: { name: 'SOVEREIGN' },
    update: {},
    create: {
      name: 'SOVEREIGN',
      domain: 'sovereign.com',
      industry: 'Procurement',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@sovereign.com' },
    update: {
      password: hashedPassword,
      isVerified: true,
      verificationCode: null,
      organizationId: organization.id,
    },
    create: {
      email: 'admin@sovereign.com',
      name: 'Chief Procurer',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'Procurement Strategy',
      position: 'System Administrator',
      organizationId: organization.id,
      isVerified: true,
    },
  });

  const vendorData = [
    {
      name: 'TechNova Solutions',
      contact: 'John Tech',
      email: 'sales@technova.com',
      category: 'Hardware',
      paymentTerms: 'Net 30',
    },
    {
      name: 'Global Logistics',
      contact: 'Sam Porter',
      email: 'info@globallog.com',
      category: 'Logistics',
      paymentTerms: 'Net 15',
    },
    {
      name: 'Office Depot',
      contact: 'Alice Office',
      email: 'support@officedepot.com',
      category: 'Supplies',
      paymentTerms: 'Due on Receipt',
    },
  ];

  for (const v of vendorData) {
    const existing = await prisma.vendor.findFirst({
      where: { organizationId: organization.id, name: v.name },
    });
    if (!existing) {
      await prisma.vendor.create({
        data: { ...v, organizationId: organization.id, status: 'ACTIVE' },
      });
    }
  }

  console.log('Seed complete.');
  console.log('  Login: admin@sovereign.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
