import { useState, useEffect } from 'react';
import { investmentsApi } from '../services/api';
import { Investment, InvestmentFormData, InvestmentType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { MAX_SYMBOL_LENGTH } from '../utils/constants';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';

const emptyForm: InvestmentFormData = {
  type: 'STOCK',
  symbol: '',
  name: '',
  quantity: 0,
  purchasePrice: 0,
  currentPrice: 0,
};

const investmentTypes: { value: InvestmentType; label: string }[] = [
  { value: 'STOCK', label: 'Stock' },
  { value: 'BOND', label: 'Bond' },
  { value: 'MUTUAL_FUND', label: 'Mutual Fund' },
];

export default function Investments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InvestmentFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadInvestments = async () => {
    try {
      const data = await investmentsApi.getAll();
      setInvestments(data.investments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const openModal = (investment?: Investment) => {
    if (investment) {
      setEditingId(investment.id);
      setForm({
        type: investment.type,
        symbol: investment.symbol,
        name: investment.name,
        quantity: investment.quantity,
        purchasePrice: investment.purchasePrice,
        currentPrice: investment.currentPrice,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await investmentsApi.update(editingId, form);
      } else {
        await investmentsApi.create(form);
      }
      await loadInvestments();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save investment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;
    try {
      await investmentsApi.delete(id);
      await loadInvestments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete investment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Investment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {investments.map((inv) => (
              <tr key={inv.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.symbol}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {inv.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{inv.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(inv.purchasePrice)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(inv.currentPrice)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => openModal(inv)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(inv.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {investments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  No investments yet. Click "Add Investment" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingId ? 'Edit Investment' : 'Add Investment'}
        error={error}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as InvestmentType })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
            >
              {investmentTypes.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <FormInput
            label="Symbol"
            id="symbol"
            value={form.symbol}
            onChange={(val) => setForm({ ...form, symbol: val.toUpperCase() })}
            required
            maxLength={MAX_SYMBOL_LENGTH}
          />
          <FormInput
            label="Name"
            id="name"
            value={form.name}
            onChange={(val) => setForm({ ...form, name: val })}
            required
          />
          <FormInput
            label="Quantity"
            id="quantity"
            type="number"
            value={form.quantity || ''}
            onChange={(val) => setForm({ ...form, quantity: parseFloat(val) || 0 })}
            required
            min="0.01"
            step="0.01"
          />
          <FormInput
            label="Purchase Price"
            id="purchasePrice"
            type="number"
            value={form.purchasePrice || ''}
            onChange={(val) => setForm({ ...form, purchasePrice: parseFloat(val) || 0 })}
            required
            min="0.01"
            step="0.01"
          />
          <FormInput
            label="Current Price"
            id="currentPrice"
            type="number"
            value={form.currentPrice || ''}
            onChange={(val) => setForm({ ...form, currentPrice: parseFloat(val) || 0 })}
            required
            min="0.01"
            step="0.01"
          />
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
