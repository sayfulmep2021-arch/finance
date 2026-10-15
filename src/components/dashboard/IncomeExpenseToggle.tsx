import React from 'react';
import { useTranslation } from '../../locales/i18nContext';

export type ToggleFilter = 'expense' | 'income';

interface IncomeExpenseToggleProps {
  activeTab: ToggleFilter;
  onChange: (tab: ToggleFilter) => void;
}

export const IncomeExpenseToggle: React.FC<IncomeExpenseToggleProps> = ({
  activeTab,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl select-none shadow-inner">
      {/* Income Tab */}
      <button
        onClick={() => onChange('income')}
        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 text-center ${
          activeTab === 'income'
            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        {t('incomeTab')}
      </button>

      {/* Expense Tab */}
      <button
        onClick={() => onChange('expense')}
        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 text-center ${
          activeTab === 'expense'
            ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        {t('expenseTab')}
      </button>
    </div>
  );
};
