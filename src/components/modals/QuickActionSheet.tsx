import React from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  HandCoins,
  PiggyBank,
  Tag,
  X,
} from 'lucide-react';
import { useTranslation } from '../../locales/i18nContext';

export type QuickActionType = 'expense' | 'income' | 'transfer' | 'loan' | 'savings' | 'categories';

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: QuickActionType) => void;
}

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const actions: Array<{
    id: QuickActionType;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    color: string;
  }> = [
    {
      id: 'expense',
      label: t('addExpenseAction'),
      sublabel: t('addExpenseSublabel'),
      icon: ArrowDownCircle,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    },
    {
      id: 'income',
      label: t('addIncomeAction'),
      sublabel: t('addIncomeSublabel'),
      icon: ArrowUpCircle,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    {
      id: 'transfer',
      label: t('transferAction'),
      sublabel: t('transferSublabel'),
      icon: ArrowLeftRight,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    },
    {
      id: 'loan',
      label: t('loanAction'),
      sublabel: t('loanSublabel'),
      icon: HandCoins,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    },
    {
      id: 'savings',
      label: t('savingsAction'),
      sublabel: t('savingsSublabel'),
      icon: PiggyBank,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
    },
    {
      id: 'categories',
      label: t('manageCategoriesAction'),
      sublabel: t('manageCategoriesSublabel'),
      icon: Tag,
      color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-slideUp">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {t('quickAdd')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 space-y-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onClose();
                  onSelectAction(act.id);
                }}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left focus:outline-none active:scale-[0.99]"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${act.color}`}>
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {act.label}
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {act.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
