import React from 'react';
import { Bell, User as UserIcon } from 'lucide-react';
import { useTranslation } from '../../locales/i18nContext';
import { getGreetingKey } from '../../utils/date';

interface AppHeaderProps {
  userName: string;
  avatarUrl?: string;
  hasUnreadAlerts?: boolean;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userName,
  avatarUrl,
  hasUnreadAlerts = true,
  onOpenNotifications,
  onOpenSettings,
}) => {
  const { t } = useTranslation();
  const greetingKey = getGreetingKey();

  return (
    <header className="flex items-center justify-between pt-3 pb-4 px-1 select-none">
      {/* Left: Greeting & Name */}
      <div>
        <span className="text-xs font-medium text-slate-500 tracking-wide block">
          {t(greetingKey)}
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
          {userName || 'Shaikat'}
        </h1>
      </div>

      {/* Right: Notifications Bell & Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none active:scale-95"
          aria-label="নোটিফিকেশন ও অ্যালার্ট"
        >
          <Bell className="w-5 h-5" strokeWidth={2.2} />
          {hasUnreadAlerts && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          )}
        </button>

        {/* Profile Avatar */}
        <button
          onClick={onOpenSettings}
          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95 transition-transform"
          aria-label="প্রোফাইল ও সেটিংস"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="./app-logo.png"
              alt={userName}
              className="w-full h-full object-cover bg-white"
            />
          )}
        </button>
      </div>
    </header>
  );
};
