import React, { useState } from 'react';
import { Plus, HandCoins, CheckCircle2, Clock, Phone, AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { db } from '../../db';
import { Loan, WalletAccount } from '../../types';
import { formatCurrency, parseAmount } from '../../utils/currency';
import { useTranslation } from '../../locales/i18nContext';

interface LoansScreenProps {
  loans: Loan[];
  wallets: WalletAccount[];
  currencySymbol: string;
  useBengaliDigits: boolean;
  onOpenAddLoan: (type?: 'lent' | 'borrowed') => void;
  onDataChanged: () => void;
}

export const LoansScreen: React.FC<LoansScreenProps> = ({
  loans,
  wallets,
  currencySymbol,
  useBengaliDigits,
  onOpenAddLoan,
  onDataChanged,
}) => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'all' | 'lent' | 'borrowed'>('all');
  const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState<Loan | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState<string>('');
  const [repaymentWalletId, setRepaymentWalletId] = useState<string>(wallets[0]?.id || '');

  // Calculate totals
  const totalLentRemaining = loans
    .filter((l) => l.type === 'lent')
    .reduce((sum, l) => sum + (l.amount - l.repaidAmount), 0);

  const totalBorrowedRemaining = loans
    .filter((l) => l.type === 'borrowed')
    .reduce((sum, l) => sum + (l.amount - l.repaidAmount), 0);

  const filteredLoans = loans.filter((l) => {
    if (activeTab === 'lent') return l.type === 'lent';
    if (activeTab === 'borrowed') return l.type === 'borrowed';
    return true;
  });

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForRepayment) return;

    const amount = parseAmount(repaymentAmount);
    const remaining = selectedLoanForRepayment.amount - selectedLoanForRepayment.repaidAmount;

    if (amount <= 0 || amount > remaining) {
      alert('সঠিক পরিশোধের পরিমাণ দিন (বকেয়ার চেয়ে বেশি হওয়া যাবে না)');
      return;
    }

    try {
      const newRepaid = selectedLoanForRepayment.repaidAmount + amount;
      const newStatus = newRepaid >= selectedLoanForRepayment.amount ? 'settled' : 'partially_paid';

      await db.transaction('rw', [db.loans, db.wallets, db.loanRepayments], async () => {
        // Record repayment record
        await db.loanRepayments.add({
          id: `rep_${Date.now()}`,
          loanId: selectedLoanForRepayment.id,
          amount,
          date: new Date().toISOString().split('T')[0],
          walletId: repaymentWalletId,
          createdAt: new Date().toISOString(),
        });

        // Update loan
        await db.loans.update(selectedLoanForRepayment.id, {
          repaidAmount: newRepaid,
          status: newStatus,
        });

        // Update wallet
        // Lent: when borrower repays us, wallet increases
        // Borrowed: when we repay lender, wallet decreases
        const wallet = await db.wallets.get(repaymentWalletId);
        if (wallet) {
          if (selectedLoanForRepayment.type === 'lent') {
            await db.wallets.update(repaymentWalletId, { balance: wallet.balance + amount });
          } else {
            await db.wallets.update(repaymentWalletId, { balance: wallet.balance - amount });
          }
        }
      });

      setSelectedLoanForRepayment(null);
      setRepaymentAmount('');
      onDataChanged();
    } catch (err: any) {
      alert(`পরিশোধ সংরক্ষণে ত্রুটি: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pt-3 pb-2 px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t('loansTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            পাওনা ও দেনার সঠিক হিসাব
          </p>
        </div>
        <button
          onClick={() => onOpenAddLoan('lent')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>নতুন ধার</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Lent (Receivable) */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
              {t('lentSummary')}
            </span>
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-extrabold text-amber-900 dark:text-amber-200 block mt-2">
            {formatCurrency(totalLentRemaining, currencySymbol, useBengaliDigits)}
          </span>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 block mt-0.5">
            অন্যদের কাছে আপনার পাওনা
          </span>
        </div>

        {/* Borrowed (Payable) */}
        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
              {t('borrowedSummary')}
            </span>
            <ArrowDownLeft className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-xl font-extrabold text-purple-900 dark:text-purple-200 block mt-2">
            {formatCurrency(totalBorrowedRemaining, currencySymbol, useBengaliDigits)}
          </span>
          <span className="text-[11px] text-purple-700 dark:text-purple-400 block mt-0.5">
            অন্যদের কাছে আপনার দেনা
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 rounded-xl transition-colors ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t('all')}
        </button>
        <button
          onClick={() => setActiveTab('lent')}
          className={`flex-1 py-2 rounded-xl transition-colors ${
            activeTab === 'lent'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t('lent')}
        </button>
        <button
          onClick={() => setActiveTab('borrowed')}
          className={`flex-1 py-2 rounded-xl transition-colors ${
            activeTab === 'borrowed'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t('borrowed')}
        </button>
      </div>

      {/* Loan List */}
      <div className="space-y-3">
        {filteredLoans.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <HandCoins className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-400">কোনো ধারের রেকর্ড পাওয়া যায়নি</p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const isLent = loan.type === 'lent';
            const remaining = loan.amount - loan.repaidAmount;
            const isSettled = loan.status === 'settled' || remaining <= 0;
            const progress = (loan.repaidAmount / loan.amount) * 100;

            return (
              <div
                key={loan.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs space-y-3"
              >
                {/* Header row: Person & Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {loan.personName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isLent
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
                        }`}
                      >
                        {isLent ? 'পাওনা' : 'দেনা'}
                      </span>
                    </div>
                    {loan.personPhone && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{loan.personPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                      {formatCurrency(remaining, currencySymbol, useBengaliDigits)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      মূল: {formatCurrency(loan.amount, currencySymbol, useBengaliDigits)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSettled
                          ? 'bg-emerald-500'
                          : isLent
                          ? 'bg-amber-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-medium">
                    <span>পরিশোধিত: {formatCurrency(loan.repaidAmount, currencySymbol, useBengaliDigits)}</span>
                    {loan.dueDate && <span>মেয়াদ: {loan.dueDate}</span>}
                  </div>
                </div>

                {/* Footer Actions */}
                {!isSettled && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-slate-700/50">
                    <span className="text-[11px] text-slate-500">
                      {loan.notes || 'কোনো মন্তব্য নেই'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedLoanForRepayment(loan);
                        setRepaymentAmount(String(remaining));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                    >
                      {t('addRepayment')}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Repayment Modal */}
      {selectedLoanForRepayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleIn">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedLoanForRepayment.type === 'lent'
                ? 'পাওনা টাকা ফেরত গ্রহণ'
                : 'দেনা টাকা পরিশোধ'}
            </h3>
            <p className="text-xs text-slate-500">
              ব্যক্তি: <strong className="text-slate-800 dark:text-slate-200">{selectedLoanForRepayment.personName}</strong>
              <br />
              অবশিষ্ট বকেয়া: <strong className="text-blue-600">{formatCurrency(selectedLoanForRepayment.amount - selectedLoanForRepayment.repaidAmount, currencySymbol)}</strong>
            </p>

            <form onSubmit={handleRepay} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  পরিশোধের পরিমাণ (৳)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-base font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  যে ওয়ালেটে সমন্বয় হবে
                </label>
                <select
                  value={repaymentWalletId}
                  onChange={(e) => setRepaymentWalletId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoanForRepayment(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
