import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  try {
    // 1. Ensure a GLOBAL organization exists
    let globalOrg = await (prisma as any).organization.findFirst({ where: { name: 'GLOBAL' } });
    if (!globalOrg) {
       globalOrg = await (prisma as any).organization.create({
         data: { name: 'GLOBAL', domain: 'global.com' }
       });
       console.log('Created GLOBAL organization:', globalOrg.id);
    } else {
       console.log('Global Org exists:', globalOrg.id);
    }

    // 2. Fix Users
    // We use raw update because findMany is crashing
    // For MongoDB, we can try to find them by organizationId: null
    // But since it's Prisma, we'll try to use the raw MongoDB driver if available,
    // OR we can just try to update everyone? No.
    
    // In Prisma 5+, for MongoDB, we can use runCommandRaw?
    // Not easily for bulk update.
    
    // Let's try this:
    // User is the one that's crashing.
    console.log('Attempting to fix users...');
    try {
      // Find one organizationId to use
      const orgId = globalOrg.id;
      
      // We can't use findMany because it crashes on data validation.
      // But maybe updateMany works without validating old data?
      const res = await (prisma as any).user.updateMany({
        where: { organizationId: { isSet: false } }, // This might work for MongoDB records missing the field
        data: { organizationId: orgId }
      });
      console.log('UpdateMany (isSet: false) users res:', res.count);

      const res2 = await (prisma as any).user.updateMany({
        where: { organizationId: null }, // This might work if it's explicitly null
        data: { organizationId: orgId }
      });
      console.log('UpdateMany (null) users res:', res2.count);
    } catch (e) {
      console.error('User fix error:', e);
    }

    // 3. Fix Vendors
    console.log('Attempting to fix vendors...');
    try {
      const orgId = globalOrg.id;
      const v1 = await (prisma as any).vendor.updateMany({
        where: { organizationId: { isSet: false } },
        data: { organizationId: orgId }
      });
      console.log('UpdateMany (isSet: false) vendors res:', v1.count);

      const v2 = await (prisma as any).vendor.updateMany({
        where: { organizationId: null },
        data: { organizationId: orgId }
      });
      console.log('UpdateMany (null) vendors res:', v2.count);
    } catch (e) {
      console.error('Vendor fix error:', e);
    }

    console.log('Fix complete.');
  } catch (err) {
    console.error('Fix failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
