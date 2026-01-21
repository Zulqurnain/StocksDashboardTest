import { Response } from 'express';
import prisma from '../db';
import { investmentSchema, updateInvestmentSchema } from '../validators';
import { AuthRequest } from '../types';
import { sendError, sendSuccess } from '../utils/response';

export async function getInvestments(req: AuthRequest, res: Response) {
  try {
    const investments = await prisma.investment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, { investments });
  } catch {
    return sendError(res, 'Internal server error', 500);
  }
}

export async function getInvestment(req: AuthRequest, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const investment = await prisma.investment.findFirst({
      where: { id, userId: req.userId },
    });
    if (!investment) return sendError(res, 'Investment not found', 404);
    return sendSuccess(res, { investment });
  } catch {
    return sendError(res, 'Internal server error', 500);
  }
}

export async function createInvestment(req: AuthRequest, res: Response) {
  try {
    const data = investmentSchema.parse(req.body);
    const investment = await prisma.investment.create({
      data: { ...data, userId: req.userId! },
    });
    await prisma.transaction.create({
      data: {
        userId: req.userId!,
        investmentId: investment.id,
        type: 'BUY',
        quantity: data.quantity,
        price: data.purchasePrice,
      },
    });
    return sendSuccess(res, { investment }, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return sendError(res, 'Invalid input data', 400);
    }
    return sendError(res, 'Internal server error', 500);
  }
}

export async function updateInvestment(req: AuthRequest, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = updateInvestmentSchema.parse(req.body);
    const existing = await prisma.investment.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return sendError(res, 'Investment not found', 404);

    const investment = await prisma.investment.update({ where: { id }, data });
    return sendSuccess(res, { investment });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return sendError(res, 'Invalid input data', 400);
    }
    return sendError(res, 'Internal server error', 500);
  }
}

export async function deleteInvestment(req: AuthRequest, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = await prisma.investment.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return sendError(res, 'Investment not found', 404);

    await prisma.investment.delete({ where: { id } });
    return sendSuccess(res, { message: 'Investment deleted successfully' });
  } catch {
    return sendError(res, 'Internal server error', 500);
  }
}
