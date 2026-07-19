import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">{t('profile')}</h1>
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
            <input 
              type="text" 
              value={user?.name || ''}
              onChange={e => updateProfile({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <p className="text-sm text-gray-500 pt-4">{t('autoSaveNotice')}</p>
        </div>
      </div>
    </div>
  );
}
