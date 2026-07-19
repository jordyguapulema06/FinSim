import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';

export default function Settings() {
  const { user, updateProfile } = useAuthStore();
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">{t('settings')}</h1>
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div className="max-w-md space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">{t('preferences')}</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('baseCurrency')}</label>
            <select 
              value={user?.currency || 'USD'}
              onChange={e => updateProfile({ currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="USD">Dólar Estadounidense (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="MXN">Peso Mexicano (MXN)</option>
              <option value="COP">Peso Colombiano (COP)</option>
              <option value="ARS">Peso Argentino (ARS)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('language')}</label>
            <select 
              value={user?.language || 'es'}
              onChange={e => updateProfile({ language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="es">{t('spanish')}</option>
              <option value="en">{t('english')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('theme')}</label>
            <select 
              value={user?.theme || 'light'}
              onChange={e => updateProfile({ theme: e.target.value as 'light' | 'dark' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="light">{t('light')}</option>
              <option value="dark">{t('dark')}</option>
            </select>
          </div>
        </div>
        
      </div>
    </div>
  );
}
