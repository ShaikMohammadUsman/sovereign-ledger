import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

function requireEnv(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    if (isProduction) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return '';
  }
  return value;
}

function parseOrigins(): string[] {
  const raw =
    process.env.CORS_ORIGINS ||
    [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'].join(',');

  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  isVercel,
  port: parseInt(process.env.PORT || '5001', 10),
  databaseUrl: requireEnv('DATABASE_URL', process.env.DATABASE_URL),
  jwtSecret:
    process.env.JWT_SECRET ||
    (isProduction ? '' : 'dev-only-jwt-secret-change-in-production'),
  corsOrigins: parseOrigins(),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendPublicUrl:
    process.env.BACKEND_PUBLIC_URL ||
    (isVercel && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 5001}`),
};

export function validateProductionEnv(): void {
  requireEnv('DATABASE_URL', process.env.DATABASE_URL);
  const secret = requireEnv('JWT_SECRET', process.env.JWT_SECRET);
  if (isProduction && secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (isProduction && env.jwtSecret === 'dev-only-jwt-secret-change-in-production') {
    throw new Error('Set a strong JWT_SECRET before running in production');
  }
}
