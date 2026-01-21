import type { Investment, InvestmentFormData, Transaction, TransactionFormData, PortfolioSummary, User } from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const authApi = {
  register: (email: string, password: string, name: string) =>
    request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request<{ user: User }>('/auth/me'),
};

export const investmentsApi = {
  getAll: () => request<{ investments: Investment[] }>('/investments'),
  get: (id: string) => request<{ investment: Investment }>(`/investments/${id}`),
  create: (data: InvestmentFormData) =>
    request<{ investment: Investment }>('/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<InvestmentFormData>) =>
    request<{ investment: Investment }>(`/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => request<{ message: string }>(`/investments/${id}`, { method: 'DELETE' }),
};

export const transactionsApi = {
  getAll: (params?: { type?: string; investmentId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.investmentId) searchParams.set('investmentId', params.investmentId);
    const query = searchParams.toString();
    return request<{ transactions: Transaction[] }>(`/transactions${query ? `?${query}` : ''}`);
  },
  create: (data: TransactionFormData) =>
    request<{ transaction: Transaction }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const portfolioApi = {
  getSummary: () => request<{ summary: PortfolioSummary }>('/portfolio/summary'),
};
