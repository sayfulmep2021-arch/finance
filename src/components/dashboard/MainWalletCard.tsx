import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { CircularProgress } from '../common/CircularProgress';
import { formatCurrency } from '../../utils/currency';
import { useTranslation } from '../../locales/i18nContext';

interface MainWalletCardProps {
  balance: number;
  income: number;
  expense: number;
  budgetSpentPercent: number;
  currencySymbol?: string;
  useBengaliDigits?: boolean;
  onIncomeClick?: () => void;
  onExpenseClick?: () => void;
}

export const MainWalletCard: React.FC<MainWalletCardProps> = ({
  balance,
  income,
  expense,
  budgetSpentPercent,
  currencySymbol = '৳',
  useBengaliDigits = false,
  onIncomeClick,
  onExpenseClick,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-50/70 via-white to-slate-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-900 border border-blue-100/70 dark:border-slate-700/60 p-5 shadow-card backdrop-blur-sm transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left Column: Title, Balance, Income/Expense Stats */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block tracking-wide">
            {t('mainWallet')}
          </span>

          {/* Main Balance */}
          <div className="mt-1 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(balance, currencySymbol, useBengaliDigits)}
          </div>

          {/* Income & Expense Badges */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            {/* Income Badge */}
            <button
              onClick={onIncomeClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors focus:outline-none"
              title={t('totalIncome')}
            >
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white">
                <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>+{formatCurrency(income, currencySymbol, useBengaliDigits)}</span>
            </button>

            {/* Expense Badge */}
            <button
              onClick={onExpenseClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors focus:outline-none"
              title={t('totalExpense')}
            >
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white">
                <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>-{formatCurrency(expense, currencySymbol, useBengaliDigits)}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Circular Progress Gauge */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <CircularProgress
            percent={budgetSpentPercent}
            size={105}
            strokeWidth={9}
            label={t('spentPercent')}
            color="#00B4D8"
          />
        </div>
      </div>
    </div>
  );
};
