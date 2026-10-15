import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle2, Plus, Edit2, ShieldAlert, PiggyBank } from 'lucide-react';
import { db } from '../../db';
import { Budget, Category, SavingsGoal, Transaction } from '../../types';
import { formatCurrency, parseAmount } from '../../utils/currency';
import { getCurrentMonthKey, getMonthDisplay } from '../../utils/date';
import { useTranslation } from '../../locales/i18nContext';

interface BudgetScreenProps {
  budget?: Budget;
  transactions: Transaction[];
  categories: Category[];
  savingsGoals: SavingsGoal[];
  currencySymbol: string;
  useBengaliDigits: boolean;
  onDataChanged: () => void;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  budget,
  transactions,
  categories,
  savingsGoals,
  currencySymbol,
  useBengaliDigits,
  onDataChanged,
}) => {
  const { t, language } = useTranslation();

  const monthKey = getCurrentMonthKey();
  const monthName = getMonthDisplay(monthKey, language);

  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState<string>(String(budget?.overallLimit || 15000));

  // Current month expenses
  const currentMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(monthKey))
    .reduce((s, t) => s + t.amount, 0);

  const overallLimit = budget?.overallLimit || 15000;
  const remaining = Math.max(0, overallLimit - currentMonthExpenses);
  const percentSpent = Math.min(100, (currentMonthExpenses / overallLimit) * 100);
  const isOverBudget = currentMonthExpenses > overallLimit;
  const isNearBudget = percentSpent >= (budget?.warningThresholdPercent || 80);

  // Category wise spend vs limit
  const categoryExpenses: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(monthKey))
    .forEach((t) => {
      categoryExpenses[t.categoryId] = (categoryExpenses[t.categoryId] || 0) + t.amount;
    });

  const handleSaveLimit = async () => {
    const val = parseAmount(newLimit);
    if (val <= 0) return;

    try {
      if (budget) {
        await db.budgets.update(budget.id, { overallLimit: val, updatedAt: new Date().toISOString() });
      } else {
        await db.budgets.add({
          id: `budget_${monthKey}`,
          month: monthKey,
          overallLimit: val,
          categoryLimits: {},
          warningThresholdPercent: 80,
          updatedAt: new Date().toISOString(),
        });
      }
      setIsEditingLimit(false);
      onDataChanged();
    } catch (err: any) {
      alert(`বাজেট সংরক্ষণে ত্রুটি: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto animate-fadeIn">
      {/* Header */}
      <div className="pt-3 pb-2 px-1">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {t('budgetTitle')} ({monthName})
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          মাসিক খরচ নিয়ন্ত্রণ ও সঞ্চয় পরিকল্পনা
        </p>
      </div>

      {/* Main Budget Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('monthlyBudget')}
          </span>
          <button
            onClick={() => setIsEditingLimit(!isEditingLimit)}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditingLimit ? 'বাতিল' : 'পরিবর্তন'}</span>
          </button>
        </div>

        {isEditingLimit ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="flex-1 px-3 py-2 text-lg font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
            />
            <button
              onClick={handleSaveLimit}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              সংরক্ষণ
            </button>
          </div>
        ) : (
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(currentMonthExpenses, currencySymbol, useBengaliDigits)}
              </span>
              <span className="text-xs text-slate-400 font-semibold ml-2">
                / {formatCurrency(overallLimit, currencySymbol, useBengaliDigits)}
              </span>
            </div>
            <span
              className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                isOverBudget
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                  : isNearBudget
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
              }`}
            >
              {Math.round(percentSpent)}%
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isOverBudget
                ? 'bg-rose-500'
                : isNearBudget
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-400'
            }`}
            style={{ width: `${percentSpent}%` }}
          />
        </div>

        {/* Remaining info */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
          <span>{t('budgetRemaining')}: {formatCurrency(remaining, currencySymbol, useBengaliDigits)}</span>
          {isOverBudget ? (
            <span className="text-rose-600 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              বাজেট ছাড়িয়েছে!
            </span>
          ) : (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              নিয়ন্ত্রণে আছে
            </span>
          )}
        </div>
      </div>

      {/* Category Limits Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white px-1">
          {t('categoryBudgets')}
        </h3>
        <div className="space-y-2">
          {categories
            .filter((c) => c.type === 'expense')
            .map((cat) => {
              const spent = categoryExpenses[cat.id] || 0;
              const limit = budget?.categoryLimits?.[cat.id] || (spent > 0 ? spent * 1.3 : 2000);
              const catPercent = Math.min(100, limit > 0 ? (spent / limit) * 100 : 0);

              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        {cat.nameBn || cat.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {formatCurrency(spent, currencySymbol, useBengaliDigits)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${catPercent}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Savings Goals Section */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {t('savingsTitle')}
          </h3>
          <span className="text-xs font-bold text-purple-600">
            {savingsGoals.length}টি লক্ষ্য
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {savingsGoals.map((goal) => {
            const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);

            return (
              <div
                key={goal.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                      <PiggyBank className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {goal.name}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        টার্গেট: {formatCurrency(goal.targetAmount, currencySymbol, useBengaliDigits)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                    {formatCurrency(goal.currentAmount, currencySymbol, useBengaliDigits)}
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>অগ্রগতি: {Math.round(progress)}%</span>
                  {goal.targetDate && <span>শেষ তারিখ: {goal.targetDate}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
