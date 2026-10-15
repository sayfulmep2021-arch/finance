import React from 'react';
import {
  Coffee,
  Fish,
  Sparkles,
  Bot,
  Utensils,
  Home,
  HeartPulse,
  Briefcase,
  Laptop,
  Receipt,
  ShoppingCart,
  Coins,
} from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatRelativeDate } from '../../utils/date';
import { useTranslation } from '../../locales/i18nContext';

interface RecentTransactionsListProps {
  transactions: Transaction[];
  type: 'expense' | 'income';
  currencySymbol?: string;
  useBengaliDigits?: boolean;
  onSeeAll: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  transactions,
  type,
  currencySymbol = '৳',
  useBengaliDigits = false,
  onSeeAll,
  onSelectTransaction,
}) => {
  const { t, language } = useTranslation();

  // Helper to render appropriate category icon matching the screenshot
  const renderCategoryIcon = (tx: Transaction) => {
    const titleLower = tx.title.toLowerCase();
    const catLower = (tx.categoryName || '').toLowerCase();

    if (titleLower.includes('চা') || catLower.includes('tea') || titleLower.includes('tea')) {
      return (
        <div className="w-11 h-11 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center flex-shrink-0">
          <Coffee className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }
    if (titleLower.includes('মাছ') || catLower.includes('fish') || titleLower.includes('fish')) {
      return (
        <div className="w-11 h-11 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center flex-shrink-0">
          <Fish className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }
    if (titleLower.includes('শ্যাম্পু') || catLower.includes('shampoo') || catLower.includes('personal')) {
      return (
        <div className="w-11 h-11 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }
    if (titleLower.includes('google') || titleLower.includes('ai') || catLower.includes('bot')) {
      return (
        <div className="w-11 h-11 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }
    if (catLower.includes('food') || titleLower.includes('খাবার')) {
      return (
        <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center flex-shrink-0">
          <Utensils className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }
    if (catLower.includes('rent') || titleLower.includes('ভাড়া')) {
      return (
        <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center flex-shrink-0">
          <Home className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }
    if (catLower.includes('medical') || catLower.includes('health')) {
      return (
        <div className="w-11 h-11 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center flex-shrink-0">
          <HeartPulse className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }
    if (catLower.includes('salary') || titleLower.includes('বেতন')) {
      return (
        <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }
    if (catLower.includes('freelance')) {
      return (
        <div className="w-11 h-11 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 flex items-center justify-center flex-shrink-0">
          <Laptop className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }
    if (tx.type === 'income') {
      return (
        <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center flex-shrink-0">
          <Coins className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    }

    return (
      <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center flex-shrink-0">
        <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          {type === 'expense' ? t('recentExpenses') : t('recentIncome')}
        </h2>
        <button
          onClick={onSeeAll}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus:outline-none"
        >
          {t('seeAll')}
        </button>
      </div>

      {/* List Items */}
      {transactions.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2 stroke-[1.5]" />
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {t('noTransactions')}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {transactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => onSelectTransaction(tx)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-card hover:border-slate-200 dark:hover:border-slate-600 transition-all text-left focus:outline-none active:scale-[0.99]"
            >
              {/* Left: Icon, Title, Date Subtitle */}
              <div className="flex items-center gap-3.5 min-w-0">
                {renderCategoryIcon(tx)}
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {tx.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5 block">
                    {formatRelativeDate(tx.date, language)}
                  </span>
                </div>
              </div>

              {/* Right: Amount */}
              <div className="flex-shrink-0 text-right ml-3">
                <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(tx.amount, currencySymbol, useBengaliDigits)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
