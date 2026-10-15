import React from 'react';
import { X, AlertTriangle, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Budget, Loan } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useTranslation } from '../../locales/i18nContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: Budget;
  monthlyExpense: number;
  loans: Loan[];
  currencySymbol?: string;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  budget,
  monthlyExpense,
  loans,
  currencySymbol = '৳',
}) => {
  const { t, language } = useTranslation();

  if (!isOpen) return null;

  const budgetLimit = budget?.overallLimit || 0;
  const budgetSpentPercent = budgetLimit > 0 ? (monthlyExpense / budgetLimit) * 100 : 0;
  const isBudgetWarning = budgetSpentPercent >= (budget?.warningThresholdPercent || 80);
  const isBudgetExceeded = budgetSpentPercent >= 100;

  // Overdue or active loans
  const activeLoans = loans.filter((l) => l.status !== 'settled');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {t('notificationsAndAlerts')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {/* Budget Warning Alert */}
          {budgetLimit > 0 && isBudgetExceeded ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-200">
                  {t('overBudgetWarning')}
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">
                  {language === 'bn'
                    ? `এই মাসে বাজেট ছিল ${formatCurrency(budgetLimit, currencySymbol)}, কিন্তু খরচ হয়েছে ${formatCurrency(monthlyExpense, currencySymbol)} (${Math.round(budgetSpentPercent)}%)!`
                    : `Budget limit was ${formatCurrency(budgetLimit, currencySymbol)}, but spent ${formatCurrency(monthlyExpense, currencySymbol)} (${Math.round(budgetSpentPercent)}%)!`}
                </p>
              </div>
            </div>
          ) : budgetLimit > 0 && isBudgetWarning ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-200">
                  {t('nearBudgetWarning')}
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {language === 'bn'
                    ? `বাজেটের ${Math.round(budgetSpentPercent)}% খরচ হয়ে গেছে। আর মাত্র ${formatCurrency(Math.max(0, budgetLimit - monthlyExpense), currencySymbol)} অবশিষ্ট আছে।`
                    : `${Math.round(budgetSpentPercent)}% of budget spent. Only ${formatCurrency(Math.max(0, budgetLimit - monthlyExpense), currencySymbol)} remaining.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                {language === 'bn' ? 'বাজেট নিয়ন্ত্রণে আছে এবং কোনো অতিরিক্ত ব্যয় নেই।' : 'Budget is under control with no overspending.'}
              </p>
            </div>
          )}

          {/* Active Loans Alerts */}
          {activeLoans.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {language === 'bn' ? 'চলমান ধার ও ঋণের তাগাদা' : 'Active Loan Reminders'}
              </h4>
              {activeLoans.map((loan) => {
                const remaining = loan.amount - loan.repaidAmount;
                const isLent = loan.type === 'lent';
                return (
                  <div
                    key={loan.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-white block">
                          {loan.personName}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {isLent ? (language === 'bn' ? 'পাওনা বাকি' : 'Receivable') : (language === 'bn' ? 'দেনা বাকি' : 'Payable')}: {formatCurrency(remaining, currencySymbol)}
                        </span>
                      </div>
                    </div>
                    {loan.dueDate && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        {loan.dueDate}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Privacy & Offline Badge */}
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-tight">
              {t('offlineReadyNotice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
