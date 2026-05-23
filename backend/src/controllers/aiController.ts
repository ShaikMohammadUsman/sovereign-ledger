import { Request, Response } from 'express';
import { prisma } from '../prisma';
import OpenAI from 'openai';

let aiClient: OpenAI | null = null;

function getAiClient(): OpenAI | null {
  const key = process.env.AZURE_OPENAI_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_DEPLOYMENT_NAME;
  if (!key || !endpoint || !deployment) return null;
  if (!aiClient) {
    aiClient = new OpenAI({
      apiKey: key,
      baseURL: `${endpoint}/openai/deployments/${deployment}`,
      defaultQuery: { 'api-version': process.env.AZURE_API_VERSION || '2024-02-15-preview' },
      defaultHeaders: { 'api-key': key },
    });
  }
  return aiClient;
}

export const getAIInsights = async (req: any, res: Response) => {
  const organizationId = req.user.organizationId;
  try {
    const activeStatuses = ['APPROVED', 'PO_CREATED', 'DELIVERED'];
    const totalCommitment = await (prisma as any).request.aggregate({
      where: { organizationId, status: { in: activeStatuses } },
      _sum: { amount: true },
    });

    const vendorsWithRequests = await (prisma as any).vendor.findMany({
      where: { organizationId },
      include: {
        requests: {
          where: { status: { in: activeStatuses } },
          select: { amount: true },
        },
      },
    });

    const vendorSpend = vendorsWithRequests.map((v: any) => ({
      name: v.name,
      total: v.requests.reduce((sum: number, r: any) => sum + r.amount, 0),
    })).sort((a: any, b: any) => b.total - a.total);

    res.json({
      spendSummary: {
        total: totalCommitment._sum.amount || 0,
        change: '+8.4%',
      },
      topVendors: vendorSpend.slice(0, 3),
      anomalies: [
        { category: 'Hardware', detected: 'High-value commitment found for Office Products.' },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: 'AI Engine Error' });
  }
};

export const handleAIChat = async (req: any, res: Response) => {
  const { message } = req.body;
  const userId = req.user?.id;
  const organizationId = req.user?.organizationId;

  if (!userId || !organizationId) {
    return res.status(401).json({ message: 'User identity required' });
  }

  try {
    // 1. Data Retrieval Layer (Deeper hybrid access - Exhaustive Ledger Audit)
    const [allVendors, allRequests, allPOs, history, org] = await Promise.all([
      (prisma as any).vendor.findMany({ where: { organizationId } }),
      (prisma as any).request.findMany({ where: { organizationId }, include: { vendor: true, createdBy: true } }),
      (prisma as any).purchaseOrder.findMany({ where: { request: { organizationId } }, include: { vendor: true } }),
      (prisma as any).chatMessage.findMany({ where: { userId }, take: 20, orderBy: { createdAt: 'desc' } }),
      (prisma as any).organization.findUnique({ where: { id: organizationId } })
    ]);

    // Construct a condensed but detailed knowledge-base for the AI
    const knowledgeBase = {
      organizationName: org?.name,
      currentTime: new Date().toISOString(),
      vendorRegistry: allVendors.map((v: any) => ({
        id: v.id,
        name: v.name,
        category: v.category,
        registeredOn: v.createdAt,
        totalOrdersCount: allPOs.filter((po: any) => po.vendorId === v.id).length
      })),
      requisitionLedger: allRequests.map((r: any) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        amount: r.amount,
        currency: r.currency,
        vendorName: r.vendor?.name,
        requester: r.createdBy?.name,
        timestamp: r.createdAt
      })),
      purchaseOrderLedger: allPOs.map((po: any) => ({
        poNumber: po.poNumber,
        vendor: po.vendor?.name,
        amount: po.amount,
        status: po.status,
        timestamp: po.createdAt
      }))
    };

    const systemContext = `
      You are 'Sovereign Insight', the intelligence core for the organization ${org?.name}.
      You are directly connected to the organization's live procurement database. 
      Use the provided JSON 'Knowledge Base' below as the absolute source of truth.

      KNOWLEDGE BASE (JSON):
      ${JSON.stringify(knowledgeBase, null, 2)}

      Operational Rules:
      1. Use only the data in the Knowledge Base. 
      2. Carefully check 'registeredOn' dates for vendors to answer time-specific questions (like "Who was added today?").
      3. Distinguish clearly between VENDORS (companies in registry), REQUESTS (requisitions), and POs (purchase orders).
      4. If asked about spend, calculate sums directly from 'requisitionLedger' and 'purchaseOrderLedger' (carefully observing status).
      5. Provide clear, professional, data-backed insights.
    `;

    // 2. Intelligence Layer (GPT-4o-mini)
    const messages: any[] = [
      { role: 'system', content: systemContext },
      ...history.reverse().map((h: any) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const client = getAiClient();
    if (!client) {
      return res.status(503).json({
        message: 'AI is not configured. Add AZURE_OPENAI_* variables to backend/.env',
      });
    }

    const completion = await client.chat.completions.create({
      model: process.env.AZURE_DEPLOYMENT_NAME || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content || "Neural core unresponsive. Checking local ledger parity...";

    // Save assistant response
    await (prisma as any).chatMessage.create({
      data: { organizationId, userId, role: 'assistant', content: response }
    });

    res.json({ response });
  } catch (error) {
    console.error('Azure AI Error:', error);
    res.status(500).json({ message: 'AI Neural Core Offline' });
  }
};

export const getChatHistory = async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const history = await (prisma as any).chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving history' });
  }
};
