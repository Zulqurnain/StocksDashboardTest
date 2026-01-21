import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../types';
import { PortfolioSummary } from '../types';
import { sendError, sendSuccess } from '../utils/response';

export async function getPortfolioSummary(req: AuthRequest, res: Response) {
  try {
    const investments = await prisma.investment.findMany({
      where: { userId: req.userId },
    });

    let totalValue = 0;
    let totalCost = 0;
    const assetsByTypeMap = new Map<string, { value: number; cost: number }>();

    for (const inv of investments) {
      const value = inv.quantity * inv.currentPrice;
      const cost = inv.quantity * inv.purchasePrice;
      totalValue += value;
      totalCost += cost;
      const existing = assetsByTypeMap.get(inv.type) || { value: 0, cost: 0 };
      assetsByTypeMap.set(inv.type, {
        value: existing.value + value,
        cost: existing.cost + cost,
      });
    }

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    const assetsByType = Array.from(assetsByTypeMap.entries()).map(([type, { value, cost }]) => ({
      type,
      value,
      cost,
      gainLoss: value - cost,
      gainLossPercent: cost > 0 ? ((value - cost) / cost) * 100 : 0,
    }));

    const summary: PortfolioSummary = {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      assetsByType,
    };

    return sendSuccess(res, { summary });
  } catch {
    return sendError(res, 'Internal server error', 500);
  }
}
