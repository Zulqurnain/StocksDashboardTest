import { Response } from 'express';
import prisma from '../db';
import { transactionSchema } from '../validators';
import { AuthRequest } from '../types';
import { sendError, sendSuccess } from '../utils/response';

export async function getTransactions(req: AuthRequest, res: Response) {
  try {
    const { type, investmentId } = req.query;
    const where: Record<string, unknown> = { userId: req.userId };
    if (type === 'BUY' || type === 'SELL') where.type = type;
    if (investmentId && typeof investmentId === 'string') where.investmentId = investmentId;

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        investment: { select: { symbol: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, { transactions });
  } catch {
    return sendError(res, 'Internal server error', 500);
  }
}

export async function createTransaction(req: AuthRequest, res: Response) {
  try {
    const data = transactionSchema.parse(req.body);
    const investment = await prisma.investment.findFirst({
      where: { id: data.investmentId, userId: req.userId },
    });
    if (!investment) return sendError(res, 'Investment not found', 404);
    if (data.type === 'SELL' && data.quantity > investment.quantity) {
      return sendError(res, 'Insufficient quantity to sell', 400);
    }

    const transaction = await prisma.transaction.create({
      data: { ...data, userId: req.userId! },
      include: { investment: { select: { symbol: true, name: true, type: true } } },
    });

    const newQuantity = data.type === 'BUY'
      ? investment.quantity + data.quantity
      : investment.quantity - data.quantity;
    await prisma.investment.update({
      where: { id: data.investmentId },
      data: { quantity: newQuantity },
    });

    return sendSuccess(res, { transaction }, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return sendError(res, 'Invalid input data', 400);
    }
    return sendError(res, 'Internal server error', 500);
  }
}
