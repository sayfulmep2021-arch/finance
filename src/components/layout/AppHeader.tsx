import React from 'react';
import { Bell, User as UserIcon, Globe } from 'lucide-react';
import { useTranslation } from '../../locales/i18nContext';

interface AppHeaderProps {
  userName: string;
  avatarUrl?: string;
  hasUnreadAlerts?: boolean;
  onOpenNotifications: () => void;
  onOpenUserImage: () => void;
  onOpenSettings?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userName,
  avatarUrl,
  hasUnreadAlerts = false,
  onOpenNotifications,
  onOpenUserImage,
}) => {
  const { t, language, toggleLanguage } = useTranslation();

  return (
    <header className="flex items-center justify-between pt-3 pb-3 px-1 select-none">
      {/* User Name and Smart Wallet System badge */}
      <div className="min-w-0 pr-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
          {userName || 'Sayful'}
        </h1>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wide">
            {t('smartWalletSystem')}
          </span>
        </div>
      </div>

      {/* Header Actions: Language Pill, Notification Bell, User Avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Instant Bilingual Language Switcher Pill */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all focus:outline-none active:scale-95"
          title={t('switchLanguage')}
          aria-label={t('switchLanguage')}
        >
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className={language === 'bn' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 font-medium'}>
            বাং
          </span>
          <span className="text-slate-300 dark:text-slate-600 text-[10px]">|</span>
          <span className={language === 'en' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 font-medium'}>
            EN
          </span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none active:scale-95"
          aria-label={t('notificationsAndAlerts')}
          title={t('notificationsAndAlerts')}
        >
          <Bell className="w-5 h-5" strokeWidth={2.2} />
          {hasUnreadAlerts && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          )}
        </button>

        {/* Dedicated User Image Avatar */}
        <button
          onClick={onOpenUserImage}
          className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-md ring-2 ring-blue-500/20 dark:ring-blue-400/20 focus:outline-none active:scale-95 transition-transform"
          aria-label={t('userProfilePhoto')}
          title={t('userProfilePhoto')}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName || 'Sayful'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
              <UserIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
