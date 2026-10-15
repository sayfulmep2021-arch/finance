import React from 'react';
import {
  Home,
  CreditCard,
  Users2,
  PieChart,
  BarChart3,
  Plus,
} from 'lucide-react';
import { useTranslation } from '../../locales/i18nContext';

export type TabType = 'home' | 'accounts' | 'loans' | 'budget' | 'stats';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenQuickAdd,
}) => {
  const { t } = useTranslation();

  const navItems: { id: TabType; labelKey: any; icon: React.ElementType }[] = [
    { id: 'home', labelKey: 'navHome', icon: Home },
    { id: 'accounts', labelKey: 'navAccounts', icon: CreditCard },
    { id: 'loans', labelKey: 'navLoans', icon: Users2 },
    { id: 'budget', labelKey: 'navBudget', icon: PieChart },
    { id: 'stats', labelKey: 'navStats', icon: BarChart3 },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) floating on the right just above bottom nav */}
      <div className="fixed bottom-20 right-4 sm:right-auto sm:max-w-md sm:w-full z-40 flex justify-end pointer-events-none px-4">
        <button
          onClick={onOpenQuickAdd}
          className="pointer-events-auto w-13 h-13 p-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none ring-4 ring-white dark:ring-slate-900"
          aria-label="নতুন লেনদেন বা ঋণ যোগ করুন"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 focus:outline-none active:scale-95 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                <span className="text-[11px] mt-1 tracking-tight">
                  {t(item.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
