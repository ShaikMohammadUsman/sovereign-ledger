import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 10 : 50,
  message: { message: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProduction ? 100 : 300,
  message: { message: 'Api throughput exceeded. Please reduce request velocity.' },
  standardHeaders: true,
  legacyHeaders: false,
});
