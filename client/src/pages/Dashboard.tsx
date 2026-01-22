import { useState, useEffect } from 'react';
import { portfolioApi, investmentsApi } from '../services/api';
import { PortfolioSummary, Investment } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';

const getColorClass = (value: number) => value >= 0 ? 'text-green-600' : 'text-red-600';

const MetricCard = ({ label, value, isPercent = false }: { label: string; value: number; isPercent?: boolean }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className={`mt-2 text-3xl font-semibold ${isPercent ? getColorClass(value) : 'text-gray-900'}`}>
      {isPercent ? formatPercent(value) : formatCurrency(value)}
    </p>
  </div>
);

const TableHeader = ({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) => (
  <th className={`px-6 py-3 ${align === 'right' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
    {children}
  </th>
);

export default function Dashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([portfolioApi.getSummary(), investmentsApi.getAll()])
      .then(([summaryData, investmentsData]) => {
        setSummary(summaryData.summary);
        setInvestments(investmentsData.investments);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>

      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard label="Total Value" value={summary.totalValue} />
            <MetricCard label="Total Cost" value={summary.totalCost} />
            <MetricCard label="Total Gain/Loss" value={summary.totalGainLoss} />
            <MetricCard label="Return" value={summary.totalGainLossPercent} isPercent />
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Performance by Asset Type</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <TableHeader>Type</TableHeader>
                    <TableHeader align="right">Value</TableHeader>
                    <TableHeader align="right">Cost</TableHeader>
                    <TableHeader align="right">Gain/Loss</TableHeader>
                    <TableHeader align="right">Return</TableHeader>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary.assetsByType.map((asset) => (
                    <tr key={asset.type}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {asset.type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(asset.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(asset.cost)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getColorClass(asset.gainLoss)}`}>
                        {formatCurrency(asset.gainLoss)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getColorClass(asset.gainLossPercent)}`}>
                        {formatPercent(asset.gainLossPercent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Investments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <TableHeader>Symbol</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader align="right">Quantity</TableHeader>
                <TableHeader align="right">Avg Cost</TableHeader>
                <TableHeader align="right">Current</TableHeader>
                <TableHeader align="right">Value</TableHeader>
                <TableHeader align="right">Gain/Loss</TableHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investments.map((inv) => {
                const value = inv.quantity * inv.currentPrice;
                const cost = inv.quantity * inv.purchasePrice;
                const gainLoss = value - cost;
                const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

                return (
                  <tr key={inv.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.symbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {inv.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{inv.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(inv.purchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(inv.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(value)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getColorClass(gainLoss)}`}>
                      {formatCurrency(gainLoss)} ({formatPercent(gainLossPercent)})
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
