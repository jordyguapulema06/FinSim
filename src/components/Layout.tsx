import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Target, LineChart, MessageSquare, User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

export default function Layout() {
  const location = useLocation();
  const { signOut, user } = useAuthStore();
  const subscribe = useFinanceStore(state => state.subscribe);
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      const unsub = subscribe(user.uid);
      return () => unsub();
    }
  }, [user, subscribe]);

  const navigation = [
    { name: t('dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('transactions'), href: '/transactions', icon: Receipt },
    { name: t('goals'), href: '/goals', icon: Target },
    { name: t('simulator'), href: '/simulator', icon: LineChart },
    { name: t('aiAdvisor'), href: '/chat', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex w-[260px] flex-col fixed inset-y-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-8 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg mr-3">
              <LineChart className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">FinSim</span>
          </div>
          <nav className="mt-5 flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                    active ? 'bg-blue-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`mr-4 flex-shrink-0 h-5 w-5 ${active ? 'text-gray-900' : 'text-gray-600 opacity-60 group-hover:opacity-100'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex p-6">
          <div className="bg-blue-50 p-4 rounded-2xl flex flex-col w-full space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate text-gray-800">{user?.name}</p>
                <p className="text-[11px] text-gray-600 truncate">{t('premiumPartner')}</p>
              </div>
            </div>
            <div className="flex flex-col w-full space-y-1 pt-3 border-t border-gray-200">
              <Link to="/profile" className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <User className="mr-3 h-4 w-4 text-gray-500" /> {t('profile')}
              </Link>
              <Link to="/settings" className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors">
                <Settings className="mr-3 h-4 w-4 text-gray-500" /> {t('settings')}
              </Link>
              <button onClick={signOut} className="flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 w-full text-left transition-colors">
                <LogOut className="mr-3 h-4 w-4 text-red-500" /> {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:pl-[260px]">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          <Outlet />
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50">
          {navigation.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href} className={`flex flex-col items-center p-2 ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                <item.icon className="h-6 w-6" />
                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
