import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { isTwilioConfigured, sendVerificationSms } from '../utils/twilio';

const isDev = process.env.NODE_ENV !== 'production';
const skipSmsVerification =
  isDev && (process.env.SKIP_SMS_VERIFICATION === 'true' || !isTwilioConfigured());

function signToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      organizationId: user.organizationId,
      role: user.role,
      name: user.name,
      department: user.department,
      position: user.position,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }
  );
}

function userPayload(user: any) {
  return {
    id: user.id,
    organizationId: user.organizationId,
    organizationName: user.organization?.name,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    position: user.position,
    employeeId: user.employeeId,
    avatar: user.avatar,
  };
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const lowerEmail = email.toLowerCase();
    const user = await (prisma as any).user.findUnique({
      where: { email: lowerEmail },
      include: { organization: true },
    });
    if (!user) {
      return res.status(401).json({ message: 'No account found for this email. Register first or use admin@sovereign.com after seeding.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    if (!user.isVerified && !skipSmsVerification) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      await (prisma as any).user.update({
        where: { id: user.id },
        data: { verificationCode },
      });

      let smsSent = false;
      if (user.phone) {
        smsSent = await sendVerificationSms(user.phone, verificationCode, user.role);
      }

      if (!smsSent && isDev) {
        console.log(`[DEV] Verification PIN for ${lowerEmail}: ${verificationCode}`);
      }

      return res.status(403).json({
        message: smsSent
          ? 'Verification code sent to your mobile.'
          : isDev
            ? `Verification required. Dev PIN (check server console): ${verificationCode}`
            : 'Verification code required. Check your mobile.',
        requiresVerification: true,
        ...(isDev && !smsSent ? { devCode: verificationCode } : {}),
      });
    }

    if (!user.isVerified && skipSmsVerification) {
      await (prisma as any).user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationCode: null },
      });
    }

    const token = signToken(user);
    res.json({ token, user: userPayload(user) });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, department, position, employeeId, avatar, companyName, phone } =
    req.body;
  try {
    const lowerEmail = email.toLowerCase();
    const domain = lowerEmail.split('@')[1];

    let organization = await (prisma as any).organization.findFirst({
      where: domain ? { OR: [{ domain }, { name: companyName }] } : { name: companyName || 'GLOBAL' },
    });

    if (!organization) {
      organization = await (prisma as any).organization.create({
        data: {
          name: (companyName || domain?.split('.')[0] || 'GLOBAL').toUpperCase(),
          domain: domain || undefined,
        },
      });
    }

    const powerRoles = ['ADMIN', 'MANAGER', 'FINANCE'];
    if (powerRoles.includes(role)) {
      const existingPersona = await (prisma as any).user.findFirst({
        where: { organizationId: organization.id, role },
      });
      if (existingPersona && role !== 'FINANCE') {
        return res.status(409).json({
          message: `A ${role} already exists for ${organization.name}.`,
        });
      }
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const autoVerify = skipSmsVerification;
    const hashedPassword = await bcrypt.hash(password, 10);

    await (prisma as any).user.create({
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
        phone: phone || null,
        isVerified: autoVerify,
        verificationCode: autoVerify ? null : verificationCode,
      },
    });

    if (!autoVerify) {
      const smsSent = phone ? await sendVerificationSms(phone, verificationCode, role) : false;
      if (!smsSent) {
        console.log(`[DEV] Verification PIN for ${lowerEmail}: ${verificationCode}`);
      }
      return res.status(201).json({
        message: smsSent ? 'Verification code sent to your mobile.' : 'Check server console for dev verification code.',
        requiresVerification: true,
        ...(isDev && !smsSent ? { devCode: verificationCode } : {}),
      });
    }

    res.status(201).json({
      message: 'Account created. You can log in now.',
      requiresVerification: false,
    });
  } catch (error: any) {
    console.error('[Register Error]:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  try {
    const user = await (prisma as any).user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ message: 'Account not found' });

    if (user.verificationCode === code) {
      await (prisma as any).user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationCode: null },
      });
      res.json({ message: 'Email verified. You can log in now.' });
    } else {
      res.status(400).json({ message: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification error' });
  }
};
