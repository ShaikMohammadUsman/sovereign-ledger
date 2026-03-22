import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await (prisma as any).user.findMany();
    console.log('Users count:', users.length);
    const usersWithNullOrg = users.filter((u: any) => !u.organizationId);
    console.log('Users with null organizationId:', usersWithNullOrg.length);
    if (usersWithNullOrg.length > 0) {
      console.log('Example user:', JSON.stringify(usersWithNullOrg[0], null, 2));
    }

    const organizations = await (prisma as any).organization.findMany();
    console.log('Organizations:', organizations.length);
    if (organizations.length > 0) {
       console.log('Organization example:', JSON.stringify(organizations[0], null, 2));
    }
    
    const vendors = await (prisma as any).vendor.findMany();
    console.log('Vendors:', vendors.length);
    const vendorsWithNullOrg = vendors.filter((v: any) => !v.organizationId);
    console.log('Vendors with null organizationId:', vendorsWithNullOrg.length);
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
