import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@sovereign.com',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'Operations',
    }
  });

  const vendor = await prisma.vendor.create({
    data: {
      name: 'Global Sourcing Corp',
      contact: 'Jim Halpert',
      email: 'jim@global.sourcing',
      category: 'IT Services',
      paymentTerms: 'Net 30',
    }
  });

  console.log('USER_ID:', user.id);
  console.log('VENDOR_ID:', vendor.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
