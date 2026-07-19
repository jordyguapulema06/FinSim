import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Calculator } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Simulator() {
  const { user } = useAuthStore();
  const { transactions, debts } = useFinanceStore();
  const { t, lang } = useTranslation();
  
  const [years, setYears] = useState(5);
  const [scenario, setScenario] = useState('maintain'); // maintain, reduce_expenses, increase_savings, pay_debts
  
  const currentIncome = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const currentExpenses = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const currentSavings = transactions.filter(t => t.type === 'savings').reduce((a, b) => a + b.amount, 0);
  const currentDebts = debts.reduce((a, b) => a + b.remainingAmount, 0);
  
  // Basic simulation engine (Compound interest, inflation simplified)
  const generateSimulation = () => {
    let simIncome = currentIncome || 0;
    let simExpenses = currentExpenses || 0;
    let simSavings = currentSavings || 0;
    let simDebts = currentDebts || 0;
    
    const inflation = 0.03;
    const savingsInterest = 0.05;
    const debtInterest = 0.15;
    
    if (scenario === 'reduce_expenses') simExpenses *= 0.8; // 20% reduction
    if (scenario === 'increase_savings') simSavings += (simIncome * 0.1); // Add 10% of income to savings
    if (scenario === 'pay_debts') simExpenses -= simDebts * 0.1; // Redirect some expenses to debts
    
    const data = [];
    let accumulatedNetWorth = (simIncome - simExpenses) + simSavings - simDebts;
    
    for (let year = 1; year <= years; year++) {
      simIncome *= (1 + inflation); // Salary adjusts to inflation ideally
      simExpenses *= (1 + inflation);
      simSavings = (simSavings + (simIncome - simExpenses)) * (1 + savingsInterest);
      simDebts = Math.max(0, simDebts * (1 + debtInterest) - (simIncome * 0.05)); // Basic debt payment logic
      
      accumulatedNetWorth = simSavings - simDebts;
      
      data.push({
        year: lang === 'es' ? `Año ${year}` : `Year ${year}`,
        patrimonio: Math.round(accumulatedNetWorth),
        ahorros: Math.round(simSavings),
        deudas: Math.round(simDebts),
      });
    }
    
    return data;
  };
  
  const simulationData = generateSimulation();

  const formatCurrency = (val: number) => new Intl.NumberFormat(user?.language || 'es', { style: 'currency', currency: user?.currency || 'USD' }).format(val);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-600 rounded-xl">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{t('financialSimulator')}</h1>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('timeHorizon')}</label>
            <input 
              type="range" min="1" max="10" 
              value={years} 
              onChange={e => setYears(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="text-center mt-2 font-medium text-blue-600">{years} {t('yearsText')}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('financialScenario')}</label>
            <select 
              value={scenario}
              onChange={e => setScenario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="maintain">{t('maintainHabits')}</option>
              <option value="reduce_expenses">{t('reduceExpenses')}</option>
              <option value="increase_savings">{t('increaseSavings')}</option>
              <option value="pay_debts">{t('payDebts')}</option>
            </select>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-500 mb-3">{t('baseData')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('income')}:</span>
                <span className="font-medium">{formatCurrency(currentIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('expenses')}:</span>
                <span className="font-medium">{formatCurrency(currentExpenses)}</span>
              </div>
            </div>
          </div>
        </div>
 
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">{t('projectionTitle', { years })}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="patrimonio" name={t('netWorth')} stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="ahorros" name={t('accumulatedSavings')} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
