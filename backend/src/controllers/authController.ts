import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const lowerEmail = email.toLowerCase();
    const user = await (prisma as any).user.findUnique({ where: { email: lowerEmail }, include: { organization: true } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Block unverified high-authority identities
    if (!user.isVerified) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      await (prisma as any).user.update({
        where: { id: user.id },
        data: { verificationCode }
      });

      if (user.phone) {
        try {
          await twilioClient.messages.create({
            body: `SOVEREIGN LEDGER | Identity Verification Code: ${verificationCode}. Access Role: ${user.role}.`,
            from: process.env.TWILIO_FROM_NUMBER,
            to: user.phone
          });
          console.log(`[TWILIO RETRY] PIN re-transmitted to ${user.phone}`);
        } catch (smsError: any) {
          console.error('[TWILIO ERROR]:', smsError.message);
        }
      }

      return res.status(403).json({ 
        message: 'IDENTITY VERIFICATION REQUIRED: A new PIN has been dispatched to your mobile.',
        requiresVerification: true 
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { 
        id: user.id, 
        organizationId: user.organizationId,
        role: user.role, 
        name: user.name, 
        department: user.department, 
        position: user.position 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { 
      id: user.id, 
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      name: user.name, 
      email: user.email, 
      role: user.role, 
      department: user.department,
      position: user.position,
      employeeId: user.employeeId,
      avatar: user.avatar
    } });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, department, position, employeeId, avatar, companyName, phone } = req.body;
  try {
    const lowerEmail = email.toLowerCase();
    const domain = lowerEmail.split('@')[1];
    
    // 1. Resolve Organization Tenant
    let organization = await (prisma as any).organization.findUnique({ 
      where: domain ? { domain } : { name: companyName || 'GLOBAL' } 
    });
    
    if (!organization) {
      organization = await (prisma as any).organization.create({
        data: { 
          name: (companyName || domain.split('.')[0]).toUpperCase(), 
          domain: domain 
        }
      });
    }

    // 2. Persona Conflict Detection
    const powerRoles = ['ADMIN', 'MANAGER', 'FINANCE'];
    if (powerRoles.includes(role)) {
      const existingPersona = await (prisma as any).user.findFirst({
        where: { organizationId: organization.id, role }
      });
      if (existingPersona && role !== 'FINANCE') {
        return res.status(409).json({ 
          message: `PROTOCOL CONFLICT: A ${role} already exists for ${organization.name}.` 
        });
      }
    }

    // 3. Identity Verification Logic
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const isPowerRole = powerRoles.includes(role);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await (prisma as any).user.create({
      data: { 
        organizationId: organization.id,
        name, 
        email: lowerEmail, 
        password: hashedPassword, 
        role: role || 'EMPLOYEE', 
        department: department || 'Operations',
        position: position || 'Strategic Procurement Analyst',
        employeeId,
        avatar,
        phone,
        isVerified: false, // Require OTP for ALL roles
        verificationCode: verificationCode
      }
    });

    if (phone) {
      try {
        await twilioClient.messages.create({
          body: `SOVEREIGN LEDGER | Identity Verification Code: ${verificationCode}. Access Role: ${role}.`,
          from: process.env.TWILIO_FROM_NUMBER,
          to: phone
        });
        console.log(`[TWILIO DISPATCH] Real-time PIN transmitted to ${phone}`);
      } catch (smsError) {
        console.error('[TWILIO ERROR]:', smsError);
        console.log(`[LOCAL DEV FALLBACK] Verification Pin for ${lowerEmail} is ${verificationCode}`);
        // Fallback or alert user
      }
    } else {
      console.log(`[LOCAL DEV FALLBACK] Verification Pin for ${lowerEmail} is ${verificationCode}`);
    }

    res.status(201).json({ 
      message: 'Identity Verification PIN transmitted to authorized mobile.',
      requiresVerification: true 
    });
  } catch (error: any) {
    console.error('[Register Error]:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'Identity already registered with this email address.' });
    }
    res.status(500).json({ message: 'Server error during identity initialization' });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  try {
    const user = await (prisma as any).user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ message: 'Identity not found' });

    if (user.verificationCode === code) {
      await (prisma as any).user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationCode: null }
      });
      res.json({ message: 'Identity Secured. You may now access the Sovereign Core.' });
    } else {
      res.status(400).json({ message: 'Invalid Verification Protocol (Invalid Code)' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification protocol error' });
  }
};
