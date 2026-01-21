import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const investmentSchema = z.object({
  type: z.enum(['STOCK', 'BOND', 'MUTUAL_FUND']),
  symbol: z.string().min(1).max(10),
  name: z.string().min(1),
  quantity: z.number().positive(),
  purchasePrice: z.number().positive(),
  currentPrice: z.number().positive(),
});

export const updateInvestmentSchema = investmentSchema.partial();

export const transactionSchema = z.object({
  investmentId: z.string().uuid(),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive(),
  price: z.number().positive(),
});
