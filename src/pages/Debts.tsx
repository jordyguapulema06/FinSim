import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { CreditCard, Plus, Trash2, Calendar, Percent, Landmark, CheckCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { Debt } from '../types';

export default function Debts() {
  const { user } = useAuthStore();
  const { debts, addDebt, deleteDebt } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    interestRate: '',
    interestRateType: 'annual', // 'annual' | 'monthly'
    monthsTerm: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const totalAmt = parseFloat(formData.totalAmount);

    await addDebt({
      uid: user.uid,
      name: formData.name,
      totalAmount: totalAmt,
      remainingAmount: totalAmt,
      interestRate: parseFloat(formData.interestRate),
      interestRateType: formData.interestRateType as 'annual' | 'monthly',
      monthsTerm: parseInt(formData.monthsTerm) || 12,
      monthsPaid: 0,
    });

    setIsAdding(false);
    setFormData({
      name: '',
      totalAmount: '',
      interestRate: '',
      interestRateType: 'annual',
      monthsTerm: '',
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(user?.language || 'es', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(val);
  };

  const calculateInstallmentDetails = (debt: Debt) => {
    const isAnnual = debt.interestRateType === 'annual';
    const rateFraction = debt.interestRate / 100;
    const months = debt.monthsTerm || 1;
    const years = months / 12;

    const totalInterest = isAnnual
      ? debt.totalAmount * rateFraction * years
      : debt.totalAmount * rateFraction * months;

    const totalWithInterest = debt.totalAmount + totalInterest;
    const estimatedInstallment = totalWithInterest / months;

    return {
      totalInterest,
      totalWithInterest,
      estimatedInstallment,
    };
  };

  return (
    <div id="debts-container" className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{t('debts')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona tus compromisos financieros y calcula cuotas mensuales con intereses.
          </p>
        </div>
        <button
          id="btn-new-debt"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Deuda
        </button>
      </div>

      {isAdding && (
        <div id="new-debt-form" className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Registrar Nueva Deuda</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Nombre</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ej. Crédito Hipotecario, Tarjeta de Crédito"
                />
                <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total Prestado</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
                <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plazo Total (Meses)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.monthsTerm}
                  onChange={(e) => setFormData({ ...formData, monthsTerm: e.target.value })}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ej. 12"
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Interés (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                  <Percent className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.interestRateType}
                  onChange={(e) => setFormData({ ...formData, interestRateType: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option value="annual">Anual</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {debts.map((debt) => {
          const { totalInterest, totalWithInterest, estimatedInstallment } = calculateInstallmentDetails(debt);
          const progress = debt.monthsTerm > 0 ? Math.min(100, Math.round(((debt.monthsPaid || 0) / debt.monthsTerm) * 100)) : 0;
          const isFullyPaid = debt.remainingAmount <= 0;

          return (
            <div
              key={debt.id}
              className={`bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all ${
                isFullyPaid ? 'border-green-300 bg-green-50/20' : ''
              }`}
            >
              {isFullyPaid && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-xl text-xs font-semibold flex items-center gap-1 shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5" /> Pagada
                </div>
              )}

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${isFullyPaid ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 leading-tight">{debt.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tasa: {debt.interestRate}% {debt.interestRateType === 'annual' ? 'Anual' : 'Mensual'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDebt(debt.id)}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Eliminar Deuda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5 mt-4">
                  {/* Progress of monthly quotas */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-gray-500">Meses pagados</span>
                      <span className="text-gray-900">
                        {debt.monthsPaid || 0} de {debt.monthsTerm} ({progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isFullyPaid ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Monto Prestado</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{formatCurrency(debt.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Monto Restante</p>
                      <p className={`font-semibold mt-0.5 ${isFullyPaid ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(debt.remainingAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-150 pt-3.5 flex justify-between items-center bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-3xl">
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Cuota Mensual Est.</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">{formatCurrency(estimatedInstallment)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Total con Intereses</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">{formatCurrency(totalWithInterest)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {debts.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300">
            No tienes deudas registradas en tu historial. ¡Buen trabajo de salud financiera!
          </div>
        )}
      </div>
    </div>
  );
}
