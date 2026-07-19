import { useFinanceStore } from '../store/financeStore';
import { useAuthStore } from '../store/authStore';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation, TranslationKey } from '../hooks/useTranslation';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { transactions, goals, debts, loading } = useFinanceStore();
  const { t } = useTranslation();

  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let savings = 0;
    
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expenses += t.amount;
      if (t.type === 'savings') savings += t.amount;
    });

    const totalDebts = debts.reduce((acc, d) => acc + d.remainingAmount, 0);
    const balance = income - expenses;
    const netWorth = balance + savings - totalDebts;
    
    // Financial Health Score (0-100)
    let health = 50;
    if (income > 0) {
      const savingsRate = savings / income;
      const debtRatio = totalDebts / (income * 12); // Assuming income is monthly
      
      if (savingsRate > 0.2) health += 20;
      else if (savingsRate > 0.1) health += 10;
      
      if (debtRatio === 0) health += 30;
      else if (debtRatio < 0.3) health += 15;
      else if (debtRatio > 0.6) health -= 20;
    }
    
    health = Math.max(0, Math.min(100, health));
    
    let healthStatusKey: TranslationKey = 'regular';
    if (health >= 80) healthStatusKey = 'excellent';
    else if (health >= 60) healthStatusKey = 'good';
    else if (health < 40) healthStatusKey = 'risky';
    else if (health < 20) healthStatusKey = 'critical';

    return { income, expenses, balance, savings, totalDebts, netWorth, health, healthStatusKey };
  }, [transactions, debts]);

  const expensesByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Translate evolution chart labels dynamically
  const evolutionData = [
    { name: t('jan'), income: 4000, expenses: 2400 },
    { name: t('feb'), income: 3000, expenses: 1398 },
    { name: t('mar'), income: 2000, expenses: 9800 },
    { name: t('apr'), income: 2780, expenses: 3908 },
    { name: t('may'), income: 1890, expenses: 4800 },
    { name: t('jun'), income: 2390, expenses: 3800 },
  ];

  if (loading) {
    return <div className="animate-pulse flex flex-col space-y-4">
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="h-40 bg-gray-200 rounded-xl"></div><div className="h-40 bg-gray-200 rounded-xl"></div><div className="h-40 bg-gray-200 rounded-xl"></div></div>
    </div>;
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat(user?.language || 'es', { style: 'currency', currency: user?.currency || 'USD' }).format(val);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{t('hello')}, {user?.name}</h1>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          stats.health >= 80 ? 'bg-green-100 text-green-700' :
          stats.health >= 60 ? 'bg-blue-100 text-blue-700' :
          stats.health >= 40 ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {t('financialHealth')}: {t(stats.healthStatusKey)} ({Math.round(stats.health)}/100)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('netWorth')} value={formatCurrency(stats.netWorth)} icon={Wallet} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title={t('income')} value={formatCurrency(stats.income)} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
        <StatCard title={t('expenses')} value={formatCurrency(stats.expenses)} icon={TrendingDown} color="text-red-600" bg="bg-red-50" />
        <StatCard title={t('savings')} value={formatCurrency(stats.savings)} icon={PiggyBank} color="text-indigo-600" bg="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">{t('moneyFlow')}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="income" name={t('income')} stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="expenses" name={t('expenses')} stroke="#ef4444" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">{t('expensesByCategory')}</h3>
          <div className="h-72 flex items-center justify-center">
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400">{t('noExpensesRecorded')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: string, icon: any, color: string, bg: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}
