import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { Transaction, TransactionType } from '../types';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Transactions() {
  const { user } = useAuthStore();
  const { transactions, addTransaction, deleteTransaction, goals, debts } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    associatedGoalId: '',
    associatedDebtId: ''
  });

  const handleTypeChange = (newType: TransactionType) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      associatedGoalId: '',
      associatedDebtId: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const txData: Omit<Transaction, 'id'> = {
      uid: user.uid,
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      description: formData.description
    };

    if (['income', 'savings'].includes(formData.type) && formData.associatedGoalId) {
      txData.associatedGoalId = formData.associatedGoalId;
    }

    if (['expense', 'debt_payment'].includes(formData.type) && formData.associatedDebtId) {
      txData.associatedDebtId = formData.associatedDebtId;
    }
    
    await addTransaction(txData);
    
    setIsAdding(false);
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      associatedGoalId: '',
      associatedDebtId: ''
    });
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat(user?.language || 'es', { style: 'currency', currency: user?.currency || 'USD' }).format(val);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex justify-between items-center w-full sm:w-auto">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{t('transactions')}</h1>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="sm:hidden flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('newTransaction')}
          </button>
        </div>

        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'income' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ingresos
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'expense' 
                ? 'bg-white text-red-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Gastos
          </button>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="hidden sm:flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('newTransaction')}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">{t('addTransactionTitle')}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
              <select 
                value={formData.type} 
                onChange={e => handleTypeChange(e.target.value as TransactionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="income">{t('incomeOpt')}</option>
                <option value="expense">{t('expenseOpt')}</option>
                <option value="savings">{t('savingsOpt')}</option>
                <option value="debt_payment">{t('debtPaymentOpt')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('amount')}</label>
              <input 
                type="number" step="0.01" required
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
              <input 
                type="text" required
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={t('categoryPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
              <input 
                type="date" required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {['income', 'savings'].includes(formData.type) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Asociar a Meta (Opcional)</label>
                <select
                  value={formData.associatedGoalId}
                  onChange={e => setFormData({ ...formData, associatedGoalId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option value="">-- Ninguna meta --</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.name} (Meta: {formatCurrency(g.targetAmount)})</option>
                  ))}
                </select>
              </div>
            )}

            {['expense', 'debt_payment'].includes(formData.type) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Asociar a Deuda (Opcional)</label>
                <select
                  value={formData.associatedDebtId}
                  onChange={e => setFormData({ ...formData, associatedDebtId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option value="">-- Ninguna deuda --</option>
                  {debts.map(d => (
                    <option key={d.id} value={d.id}>{d.name} (Restante: {formatCurrency(d.remainingAmount)})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
              <input 
                type="text"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={t('descriptionPlaceholder')}
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                {t('cancel')}
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {tx.category}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                  tx.type === 'expense' ? 'text-red-600' : 
                  tx.type === 'income' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => deleteTransaction(tx.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  {t('noTransactionsRecorded')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
