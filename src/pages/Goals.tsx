import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { Target, Plus } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Goals() {
  const { user } = useAuthStore();
  const { goals, addGoal } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    await addGoal({
      uid: user.uid,
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline
    });
    
    setIsAdding(false);
    setFormData({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat(user?.language || 'es', { style: 'currency', currency: user?.currency || 'USD' }).format(val);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{t('financialGoals')}</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('newGoal')}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('goalName')}</label>
              <input 
                type="text" required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={t('goalPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('deadline')}</label>
              <input 
                type="date" required
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('targetAmount')}</label>
              <input 
                type="number" required
                value={formData.targetAmount}
                onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('currentSavings')}</label>
              <input 
                type="number"
                value={formData.currentAmount}
                onChange={e => setFormData({...formData, currentAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">{t('cancel')}</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">{t('saveGoalBtn')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          return (
            <div key={goal.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{goal.name}</h3>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">{t('progress')}</span>
                  <span className="font-medium text-gray-900">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-sm mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">{t('current')}</span>
                    <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">{t('target')}</span>
                    <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300">
            {t('noGoalsRecorded')}
          </div>
        )}
      </div>
    </div>
  );
}
