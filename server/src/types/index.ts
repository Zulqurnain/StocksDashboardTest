import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface JwtPayload {
  userId: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  assetsByType: {
    type: string;
    value: number;
    cost: number;
    gainLoss: number;
    gainLossPercent: number;
  }[];
}
