import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { db } from '../../db';
import { Loan, LoanType, WalletAccount } from '../../types';
import { parseAmount } from '../../utils/currency';
import { useTranslation } from '../../locales/i18nContext';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletAccount[];
  initialType?: LoanType;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
  isOpen,
  onClose,
  wallets,
  initialType = 'lent',
}) => {
  const { t } = useTranslation();

  const [type, setType] = useState<LoanType>(initialType);
  const [personName, setPersonName] = useState<string>('');
  const [personPhone, setPersonPhone] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [walletId, setWalletId] = useState<string>(wallets[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseAmount(amount);
    if (parsedAmount <= 0) {
      alert('সঠিক টাকার পরিমাণ দিন');
      return;
    }
    if (!personName.trim()) {
      alert('ব্যক্তির নাম দিন');
      return;
    }

    setIsSubmitting(true);
    try {
      const loanData: Loan = {
        id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type,
        personName: personName.trim(),
        personPhone: personPhone.trim() || undefined,
        amount: parsedAmount,
        repaidAmount: 0,
        walletId,
        date,
        dueDate: dueDate || undefined,
        notes: notes.trim() || undefined,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      await db.transaction('rw', [db.loans, db.wallets], async () => {
        await db.loans.add(loanData);
        // Accounting: Lent reduces wallet balance; Borrowed increases wallet balance
        const wallet = await db.wallets.get(walletId);
        if (wallet) {
          if (type === 'lent') {
            await db.wallets.update(walletId, { balance: wallet.balance - parsedAmount });
          } else {
            await db.wallets.update(walletId, { balance: wallet.balance + parsedAmount });
          }
        }
      });

      onClose();
    } catch (err: any) {
      alert(`ধার সংরক্ষণে ত্রুটি: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {t('addNewLoan')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Segmented Loan Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('lent')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'lent'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('lent')}
            </button>
            <button
              type="button"
              onClick={() => setType('borrowed')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'borrowed'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('borrowed')}
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              {t('amount')} (৳ BDT) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ৳
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className="w-full pl-10 pr-4 py-3 text-2xl font-extrabold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Person Name & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {t('personName')} *
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="ব্যক্তির নাম..."
                required
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {t('personPhone')}
              </label>
              <input
                type="tel"
                value={personPhone}
                onChange={(e) => setPersonPhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Wallet */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              ওয়ালেট / একাউন্ট *
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (৳{w.balance})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {t('dueDate')}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              {t('notes')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="উদ্দেশ্য বা বিশেষ শর্ত..."
              className="w-full px-4 py-2 text-xs font-medium text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t('save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
