import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const createRequest = async (req: any, res: Response) => {
  const { title, description, amount, currency, department, urgency, vendor, status } = req.body;
  const organizationId = req.user.organizationId;
  const userId = req.user.id;

  try {
    let vendorId = null;
    if (vendor) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(vendor);
      if (isObjectId) {
        const vendorById = await (prisma as any).vendor.findFirst({ where: { id: vendor, organizationId } });
        if (vendorById) vendorId = vendorById.id;
      }
      
      if (!vendorId) {
        let vendorByName = await (prisma as any).vendor.findFirst({ where: { name: vendor, organizationId } });
        if (!vendorByName) {
          vendorByName = await (prisma as any).vendor.create({
            data: { organizationId, name: vendor, contact: 'N/A', email: 'N/A', category: 'General', paymentTerms: 'Net 30' }
          });
        }
        vendorId = vendorByName.id;
      }
    }

    const request = await (prisma as any).request.create({
      data: {
        organizationId,
        title,
        description,
        amount: parseFloat(amount as any),
        currency: currency || 'USD',
        department,
        urgency,
        vendorId,
        status: status || 'SUBMITTED',
        createdById: userId,
      }
    });
    res.status(201).json(request);
  } catch (error: any) {
    console.error('[Create Request Error]:', error);
    res.status(500).json({ message: 'Error initializing organizational requisition' });
  }
};

export const getRequests = async (req: any, res: Response) => {
  const organizationId = req.user.organizationId;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const whereClause: any = { organizationId };
    
    // Employees ONLY see their own requests. 
    // Admins and Finance can see the entire organization ledger.
    if (role === 'EMPLOYEE') {
       whereClause.createdById = userId;
    }

    const requests = await (prisma as any).request.findMany({
      where: whereClause,
      include: { vendor: true, createdBy: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error accessing organization ledger' });
  }
};

export const getRequestDetails = async (req: any, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user.organizationId;
  try {
    const request = await (prisma as any).request.findFirst({
      where: { id, organizationId },
      include: { vendor: true, createdBy: true, approvals: { include: { approver: true } } }
    });
    if (!request) return res.status(404).json({ message: 'Request strictly isolated or not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Access denied to organization vault' });
  }
};

export const updateRequestStatus = async (req: any, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const organizationId = req.user.organizationId;
  try {
    const request = await (prisma as any).request.updateMany({
      where: { id, organizationId },
      data: { status }
    });
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Status update protocol failed' });
  }
};

export const updateRequest = async (req: any, res: Response) => {
  const { id } = req.params;
  const { title, description, amount, currency, department, urgency, vendor, status } = req.body;
  const organizationId = req.user.organizationId;
  try {
    let vendorId = undefined;
    if (vendor !== undefined) {
      if (!vendor) {
        vendorId = null;
      } else {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(vendor);
        if (isObjectId) {
          const v = await (prisma as any).vendor.findFirst({ where: { id: vendor, organizationId } });
          if (v) vendorId = v.id;
        }
        if (!vendorId) {
          let v = await (prisma as any).vendor.findFirst({ where: { name: vendor, organizationId } });
          if (!v) {
            v = await (prisma as any).vendor.create({
              data: { organizationId, name: vendor, contact: 'N/A', email: 'N/A', category: 'General', paymentTerms: 'Net 30' }
            });
          }
          vendorId = v.id;
        }
      }
    }

    const request = await (prisma as any).request.updateMany({
      where: { id, organizationId },
      data: { 
        title, 
        description, 
        amount: amount ? parseFloat(amount as any) : undefined,
        currency,
        department, 
        urgency, 
        vendorId,
        status
      }
    });
    res.json({ message: 'Requisition modified successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Modification denied' });
  }
};

export const deleteRequest = async (req: any, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user.organizationId;
  try {
    // Only delete if it belongs to organization
    const request = await (prisma as any).request.findFirst({ where: { id, organizationId } });
    if (!request) return res.status(403).json({ message: 'Deletion unauthorized' });

    await (prisma as any).approval.deleteMany({ where: { requestId: id } });
    await (prisma as any).purchaseOrder.deleteMany({ where: { requestId: id } });
    await (prisma as any).request.delete({ where: { id } });
    res.json({ message: 'Requisition purged from ledger' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion protocol failed' });
  }
};
