export interface User {
  id: string;
  email: string;
  name: string;
}

export type InvestmentType = 'STOCK' | 'BOND' | 'MUTUAL_FUND';
export type TransactionType = 'BUY' | 'SELL';

export interface Investment {
  id: string;
  userId: string;
  type: InvestmentType;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  investmentId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  createdAt: string;
  investment: {
    symbol: string;
    name: string;
    type: InvestmentType;
  };
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

export interface InvestmentFormData {
  type: InvestmentType;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
}

export interface TransactionFormData {
  investmentId: string;
  type: TransactionType;
  quantity: number;
  price: number;
}
