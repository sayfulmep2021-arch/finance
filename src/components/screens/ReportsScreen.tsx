import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { Transaction, Category, FamilyMember } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useTranslation } from '../../locales/i18nContext';

interface ReportsScreenProps {
  transactions: Transaction[];
  categories: Category[];
  members: FamilyMember[];
  currencySymbol: string;
  useBengaliDigits: boolean;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  transactions,
  categories,
  members,
  currencySymbol,
  useBengaliDigits,
}) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'this_month' | 'all'>('this_month');

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const filteredTx = transactions.filter((t) => {
    if (period === 'this_month') return t.date.startsWith(currentMonthKey);
    return true;
  });

  const totalIncome = filteredTx
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = filteredTx
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

  // Category wise expense breakdown
  const categoryMap: Record<string, number> = {};
  filteredTx
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap[t.categoryId] = (categoryMap[t.categoryId] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryMap)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat?.nameBn || cat?.name || 'Other',
        color: cat?.color || '#3B82F6',
        amount,
        percent: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Member wise expense breakdown
  const memberMap: Record<string, number> = {};
  filteredTx
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const mId = t.memberId || 'other';
      memberMap[mId] = (memberMap[mId] || 0) + t.amount;
    });

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pt-3 pb-2 px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t('statsTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            আর্থিক বিশ্লেষণ ও খাতের বিবরণ
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setPeriod('this_month')}
            className={`px-2.5 py-1 rounded-lg ${
              period === 'this_month' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            চলতি মাস
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-2.5 py-1 rounded-lg ${
              period === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            সর্বমোট
          </button>
        </div>
      </div>

      {/* Income vs Expense Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-bold">{t('totalIncome')}</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200 block mt-2">
            +{formatCurrency(totalIncome, currencySymbol, useBengaliDigits)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
            <span className="text-xs font-bold">{t('totalExpense')}</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <span className="text-xl font-extrabold text-rose-900 dark:text-rose-200 block mt-2">
            -{formatCurrency(totalExpense, currencySymbol, useBengaliDigits)}
          </span>
        </div>
      </div>

      {/* Savings Rate Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-500 block">
            সঞ্চয়ের হার (Savings Rate)
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-white block mt-0.5">
            উদ্বৃত্ত: {formatCurrency(netSavings, currencySymbol, useBengaliDigits)}
          </span>
        </div>
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center font-extrabold text-blue-600 text-xs">
          {Math.round(savingsRate)}%
        </div>
      </div>

      {/* Expense by Category Breakdown */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('expenseByCategory')}
        </h3>

        {sortedCategories.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">কোনো ব্যয়ের তথ্য নেই</p>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map((cat) => (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cat.name}
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    {formatCurrency(cat.amount, currencySymbol, useBengaliDigits)} ({Math.round(cat.percent)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percent}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Breakdown */}
      {members.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('familyDistribution')}
            </h3>
          </div>
          <div className="space-y-2">
            {members.map((m) => {
              const spent = memberMap[m.id] || 0;
              const percent = totalExpense > 0 ? (spent / totalExpense) * 100 : 0;
              return (
                <div key={m.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{m.name}</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    {formatCurrency(spent, currencySymbol, useBengaliDigits)} ({Math.round(percent)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
