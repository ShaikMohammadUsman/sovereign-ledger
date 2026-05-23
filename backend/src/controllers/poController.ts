import { Request, Response } from 'express';
import { prisma } from '../prisma';
import {
  syncPurchaseOrderFinancialsFromZoho,
  syncPurchaseOrderToZohoIfConnected,
} from '../utils/zohoSync';

export const generatePO = async (req: Request, res: Response) => {
  const { requestId } = req.body;
  try {
    const request = await (prisma as any).request.findUnique({
      where: { id: requestId },
      include: { vendor: true },
    });

    if (!request) {
      return res.status(404).json({ message: 'REQUISITION NOT FOUND: Protocol record missing.' });
    }

    if (request.status !== 'APPROVED') {
      return res.status(400).json({ message: `AUTHORIZATION FAILED: Requisition is currently '${request.status}'. Status 'APPROVED' required.` });
    }

    // Check if PO already exists
    const existingPO = await (prisma as any).purchaseOrder.findUnique({ where: { requestId } });
    if (existingPO) {
       return res.status(409).json({ message: 'PROTOCOL CONFLICT: Purchase Order already exists for this requestId.' });
    }

    let finalVendorId = request.vendorId;
    if (!finalVendorId) {
      // Find or create fallback General Vendor for this specific organization
      let fallbackVendor = await (prisma as any).vendor.findFirst({ 
        where: { name: 'General Vendor', organizationId: request.organizationId } 
      });
      
      if (!fallbackVendor) {
        fallbackVendor = await (prisma as any).vendor.create({
          data: { 
            organizationId: request.organizationId,
            name: 'General Vendor', 
            contact: 'N/A', 
            email: 'general@vendor.local', 
            category: 'General', 
            paymentTerms: 'Net 30' 
          }
        });
      }
      finalVendorId = fallbackVendor.id;
      
      // Update the request so it retains the fallback vendor
      await (prisma as any).request.update({
        where: { id: requestId },
        data: { vendorId: finalVendorId }
      });
    }

    // Auto-generate unique po-number (e.g., PO-XXXXXX)
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
    const poNumber = `PO-${randomHex}`;

    const po = await (prisma as any).purchaseOrder.create({
      data: {
        requestId,
        poNumber,
        vendorId: finalVendorId,
        amount: request.amount,
        currency: request.currency,
      },
    });

    // Update request status to PO_CREATED
    await (prisma as any).request.update({
      where: { id: requestId },
      data: { status: 'PO_CREATED' },
    });

    const poWithVendor = await (prisma as any).purchaseOrder.findUnique({
      where: { id: po.id },
      include: { vendor: true, request: true },
    });

    const zohoSync = await syncPurchaseOrderToZohoIfConnected(
      request.organizationId,
      po.id,
      request.title
    );

    let zohoFinancials = null;
    if (zohoSync.synced) {
      try {
        zohoFinancials = await syncPurchaseOrderFinancialsFromZoho(
          request.organizationId,
          po.id
        );
      } catch {
        /* bill may not exist yet in Books */
      }
    }

    const finalPo = await (prisma as any).purchaseOrder.findUnique({
      where: { id: po.id },
      include: { vendor: true, request: true },
    });

    res.status(201).json({
      ...finalPo,
      zohoSync,
      zohoFinancials,
    });
  } catch (error: any) {
    console.error('[PO Generation Error]:', error);
    res.status(500).json({ message: 'PO Generation Error: internal engine conflict.' });
  }
};

export const getPOs = async (req: any, res: Response) => {
  const organizationId = req.user.organizationId;
  try {
    const pos = await (prisma as any).purchaseOrder.findMany({
      where: {
        request: { organizationId }
      },
      include: { vendor: true, request: true },
    });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getPODetails = async (req: any, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user.organizationId;
  try {
    const po = await (prisma as any).purchaseOrder.findFirst({
      where: { 
        id,
        request: { organizationId }
      },
      include: { vendor: true, request: { include: { createdBy: true, approvals: { include: { approver: true } } } } },
    });
    if (!po) return res.status(404).json({ message: 'PO Not Found or Access Denied' });
    res.json(po);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
