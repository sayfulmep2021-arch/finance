import React, { useState } from 'react';
import {
  User,
  Globe,
  Tag,
  Download,
  Smartphone,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { db, resetDatabaseToCleanState } from '../../db';
import { AppSettings, FamilyMember, Category } from '../../types';
import { useTranslation } from '../../locales/i18nContext';

interface SettingsScreenProps {
  settings: AppSettings;
  members: FamilyMember[];
  categories?: Category[];
  onOpenCategoriesModal?: () => void;
  onOpenBackupModal: () => void;
  onOpenInstallGuide?: () => void;
  onOpenUserImage?: () => void;
  onDataChanged: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  members,
  categories = [],
  onOpenCategoriesModal,
  onOpenBackupModal,
  onOpenInstallGuide,
  onOpenUserImage,
  onDataChanged,
}) => {
  const { t, language, setLanguage } = useTranslation();

  const [userName, setUserName] = useState(settings?.userName || 'Sayful');
  const [currency, setCurrency] = useState(settings?.currencySymbol || '৳');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // Sync state if settings prop changes
  React.useEffect(() => {
    if (settings?.userName) {
      setUserName(settings.userName);
    }
  }, [settings?.userName]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.settings.put({
        ...settings,
        userName: userName.trim() || 'Sayful',
        currencySymbol: currency,
      });
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2000);
      onDataChanged();
    } catch (err: any) {
      alert(`${t('saveSettingsError')}: ${err.message}`);
    }
  };

  const handleResetData = async () => {
    if (!confirm(t('resetDataConfirm'))) return;
    try {
      await resetDatabaseToCleanState();
      alert(t('resetDataSuccess'));
      onDataChanged();
    } catch (err: any) {
      alert(`${t('resetDataError')}: ${err.message}`);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      await db.familyMembers.add({
        id: `mem_${Date.now()}`,
        name: newMemberName.trim(),
        role: 'family',
        avatarColor: '#3B82F6',
        createdAt: new Date().toISOString(),
      });
      setNewMemberName('');
      onDataChanged();
    } catch (err: any) {
      alert(`${t('addMemberError')}: ${err.message}`);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm(t('deleteMemberConfirm'))) return;
    try {
      await db.familyMembers.delete(id);
      onDataChanged();
    } catch (err: any) {
      alert(`${t('deleteMemberError')}: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto animate-fadeIn">
      {/* Header */}
      <div className="pt-3 pb-2 px-1">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('settingsSubtitle')}
        </p>
      </div>

      {isSavedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{t('settingsSaved')}</span>
        </div>
      )}

      {/* Prominent Bilingual Language Switcher */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                {t('language')}
              </span>
              <span className="text-xs text-slate-400">
                {language === 'bn' ? 'বাংলা ভাষা সক্রিয়' : 'English language active'}
              </span>
            </div>
          </div>
        </div>

        {/* Big Touch-Friendly Bilingual Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-700/60 rounded-2xl">
          <button
            type="button"
            onClick={() => setLanguage('bn')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              language === 'bn'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'bn' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            <span>{t('languageBengali')}</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              language === 'en'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'en' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            <span>{t('languageEnglish')}</span>
          </button>
        </div>
      </div>

      {/* Dedicated Category Management Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Tag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                {t('manageCategories')}
              </span>
              <span className="text-xs text-slate-400">
                {categories.length} {t('categoriesCount')}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          {t('categoriesManagementCardDesc')}
        </p>
        {onOpenCategoriesModal && (
          <button
            type="button"
            data-testid="btn-manage-categories"
            onClick={onOpenCategoriesModal}
            className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-2 border border-blue-200/70 dark:border-blue-900/50 transition-colors"
          >
            <Tag className="w-4 h-4 stroke-[2.2]" />
            <span>{t('manageCategories')}</span>
          </button>
        )}
      </div>

      {/* Profile Form */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span>{t('profileSettings')}</span>
        </h3>

        {/* User Photo Preview & Change */}
        <div className="flex items-center gap-3.5 pb-2 border-b border-slate-100 dark:border-slate-700/80">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm ring-2 ring-blue-500/20 bg-slate-100 dark:bg-slate-700 flex-shrink-0">
            {settings?.userAvatar ? (
              <img src={settings.userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              {userName}
            </span>
            {onOpenUserImage && (
              <button
                type="button"
                onClick={onOpenUserImage}
                className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 focus:outline-none"
              >
                <span>{settings?.userAvatar ? t('changePhoto') : t('uploadPhoto')}</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              {t('userName')}
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              {t('currency')}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
            >
              <option value="৳">৳ BDT (টাকা)</option>
              <option value="$">$ USD (ডলার)</option>
              <option value="€">€ EUR (ইউরো)</option>
              <option value="₹">₹ INR (রুপি)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
          >
            {t('save')}
          </button>
        </form>
      </div>

      {/* Family Members Management */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('familyMembersTitle')} ({members.length})
        </h3>
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {m.name}
              </span>
              {m.role !== 'self' && (
                <button
                  type="button"
                  onClick={() => handleDeleteMember(m.id)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                  title={t('delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleAddMember} className="flex gap-2 pt-1">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder={t('newMemberPlaceholder')}
            className="flex-1 px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
          >
            {t('add')}
          </button>
        </form>
      </div>

      {/* Backup & Restore Action */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-600" />
          <span>{t('backupAndRestore')}</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {t('backupPrivacyNotice')}
        </p>
        <button
          onClick={onOpenBackupModal}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
        >
          {t('openBackupModal')}
        </button>
      </div>

      {/* Chrome PWA Installation Instructions */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-blue-700 dark:text-blue-400">
          <Smartphone className="w-5 h-5 stroke-[2.2]" />
          <h3 className="text-sm font-bold">
            {t('installApp')} (Android & Chrome)
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {t('installGuide')}
        </p>
        <button
          onClick={onOpenInstallGuide}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Smartphone className="w-4 h-4" />
          <span>{t('installNowPhone')}</span>
        </button>
        <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/50 text-[11px] font-medium text-slate-600 dark:text-slate-400 space-y-0.5">
          <div>{t('pwaBenefitNoApk')}</div>
          <div>{t('pwaBenefitOffline')}</div>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="p-5 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>{t('resetData')}</span>
        </h3>
        <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
          {t('resetWarningDesc')}
        </p>
        <button
          onClick={handleResetData}
          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
        >
          {t('resetData')}
        </button>
      </div>
    </div>
  );
};
