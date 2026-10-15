import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import { Transaction, WalletAccount, Category, FamilyMember } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatRelativeDate } from '../../utils/date';
import { useTranslation } from '../../locales/i18nContext';

interface TransactionsScreenProps {
  transactions: Transaction[];
  wallets: WalletAccount[];
  categories: Category[];
  members: FamilyMember[];
  currencySymbol: string;
  useBengaliDigits: boolean;
  onSelectTransaction: (tx: Transaction) => void;
  onAddTransaction: () => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  wallets,
  categories,
  members,
  currencySymbol,
  useBengaliDigits,
  onSelectTransaction,
  onAddTransaction,
}) => {
  const { t, language } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      const matchesSearch =
        searchTerm === '' ||
        tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.categoryNameBn && tx.categoryNameBn.includes(searchTerm)) ||
        String(tx.amount).includes(searchTerm);

      // Type
      const matchesType = selectedType === 'all' || tx.type === selectedType;

      // Wallet
      const matchesWallet = selectedWallet === 'all' || tx.walletId === selectedWallet;

      // Member
      const matchesMember = selectedMember === 'all' || tx.memberId === selectedMember;

      return matchesSearch && matchesType && matchesWallet && matchesMember;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, selectedType, selectedWallet, selectedMember]);

  // Totals for filtered records
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-3 pb-2 px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t('navAccounts')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? `মোট ${filteredTransactions.length}টি লেনদেন`
              : `${filteredTransactions.length} transactions`}
          </p>
        </div>
        <button
          onClick={onAddTransaction}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('add')}</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs">
        <div className="text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">
            {t('totalIncome')}
          </span>
          <span className="text-xs font-bold text-emerald-600 block mt-1">
            +{formatCurrency(totalIncome, currencySymbol, useBengaliDigits)}
          </span>
        </div>
        <div className="text-center border-x border-slate-100 dark:border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">
            {t('totalExpense')}
          </span>
          <span className="text-xs font-bold text-rose-600 block mt-1">
            -{formatCurrency(totalExpense, currencySymbol, useBengaliDigits)}
          </span>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">
            {language === 'bn' ? 'স্থিতি' : 'Net Balance'}
          </span>
          <span
            className={`text-xs font-bold block mt-1 ${
              netBalance >= 0 ? 'text-blue-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(netBalance, currencySymbol, useBengaliDigits)}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('search')}
          className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters (Type, Wallet, Member) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        {['all', 'expense', 'income', 'transfer'].map((tp) => (
          <button
            key={tp}
            onClick={() => setSelectedType(tp)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              selectedType === tp
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {tp === 'all'
              ? t('all')
              : tp === 'expense'
              ? t('expense')
              : tp === 'income'
              ? t('income')
              : t('transfer')}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-400">কোনো লেনদেন পাওয়া যায়নি</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const wallet = wallets.find((w) => w.id === tx.walletId);
            const isExpense = tx.type === 'expense';
            const isIncome = tx.type === 'income';

            return (
              <button
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 shadow-xs text-left transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isExpense
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        : isIncome
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                    }`}
                  >
                    {isExpense ? (
                      <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                    ) : isIncome ? (
                      <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      {tx.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{formatRelativeDate(tx.date, language)}</span>
                      <span>•</span>
                      <span className="truncate">{wallet?.name || 'Wallet'}</span>
                      {tx.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{tx.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-3">
                  <span
                    className={`text-sm font-bold tracking-tight block ${
                      isExpense
                        ? 'text-rose-600 dark:text-rose-400'
                        : isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {isExpense ? '-' : isIncome ? '+' : ''}
                    {formatCurrency(tx.amount, currencySymbol, useBengaliDigits)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {language === 'bn' ? (tx.categoryNameBn || tx.categoryName) : (tx.categoryName || tx.categoryNameBn)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
