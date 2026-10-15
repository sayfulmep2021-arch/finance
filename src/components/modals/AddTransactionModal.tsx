import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { db } from '../../db';
import { Transaction, TransactionType, PaymentMethod, Category, WalletAccount, FamilyMember } from '../../types';
import { parseAmount } from '../../utils/currency';
import { useTranslation } from '../../locales/i18nContext';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  wallets: WalletAccount[];
  members: FamilyMember[];
  editTransaction?: Transaction | null;
  initialType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  wallets,
  members,
  editTransaction,
  initialType = 'expense',
}) => {
  const { t } = useTranslation();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [targetWalletId, setTargetWalletId] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setTitle(editTransaction.title);
      setCategoryId(editTransaction.categoryId);
      setWalletId(editTransaction.walletId);
      setTargetWalletId(editTransaction.targetWalletId || '');
      setMemberId(editTransaction.memberId || '');
      setDate(editTransaction.date);
      setPaymentMethod(editTransaction.paymentMethod);
      setNotes(editTransaction.notes || '');
    } else {
      setType(initialType);
      setAmount('');
      setTitle('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      if (wallets.length > 0 && !walletId) {
        setWalletId(wallets[0].id);
      }
    }
  }, [editTransaction, initialType, isOpen, wallets]);

  const filteredCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  useEffect(() => {
    if (!categoryId && filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [type, filteredCategories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseAmount(amount);
    if (parsedAmount <= 0) {
      alert('সঠিক টাকার পরিমাণ দিন');
      return;
    }
    if (!title.trim()) {
      alert('লেনদেনের বিবরণ বা শিরোনাম দিন');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCategory = categories.find((c) => c.id === categoryId);

      const txData: Transaction = {
        id: editTransaction ? editTransaction.id : `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type,
        amount: parsedAmount,
        categoryId: type === 'transfer' ? 'cat_transfer' : categoryId,
        categoryName: selectedCategory ? selectedCategory.name : 'Transfer',
        categoryNameBn: selectedCategory ? selectedCategory.nameBn : 'ট্রান্সফার',
        walletId,
        targetWalletId: type === 'transfer' ? targetWalletId : undefined,
        memberId: memberId || undefined,
        title: title.trim(),
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
        createdAt: editTransaction ? editTransaction.createdAt : new Date().toISOString(),
      };

      await db.transaction('rw', [db.transactions, db.wallets], async () => {
        // Reverse previous transaction effect if editing
        if (editTransaction) {
          const oldWallet = await db.wallets.get(editTransaction.walletId);
          if (oldWallet) {
            if (editTransaction.type === 'expense') {
              await db.wallets.update(oldWallet.id, { balance: oldWallet.balance + editTransaction.amount });
            } else if (editTransaction.type === 'income') {
              await db.wallets.update(oldWallet.id, { balance: oldWallet.balance - editTransaction.amount });
            } else if (editTransaction.type === 'transfer' && editTransaction.targetWalletId) {
              const oldTarget = await db.wallets.get(editTransaction.targetWalletId);
              await db.wallets.update(oldWallet.id, { balance: oldWallet.balance + editTransaction.amount });
              if (oldTarget) {
                await db.wallets.update(oldTarget.id, { balance: oldTarget.balance - editTransaction.amount });
              }
            }
          }
          await db.transactions.put(txData);
        } else {
          await db.transactions.add(txData);
        }

        // Apply new transaction to wallet balance
        const currentWallet = await db.wallets.get(walletId);
        if (currentWallet) {
          if (type === 'expense') {
            await db.wallets.update(walletId, { balance: currentWallet.balance - parsedAmount });
          } else if (type === 'income') {
            await db.wallets.update(walletId, { balance: currentWallet.balance + parsedAmount });
          } else if (type === 'transfer' && targetWalletId) {
            const targetW = await db.wallets.get(targetWalletId);
            await db.wallets.update(walletId, { balance: currentWallet.balance - parsedAmount });
            if (targetW) {
              await db.wallets.update(targetWalletId, { balance: targetW.balance + parsedAmount });
            }
          }
        }
      });

      onClose();
    } catch (err: any) {
      alert(`লেনদেন সংরক্ষণে ত্রুটি: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editTransaction) return;
    if (!confirm('আপনি কি এই লেনদেনটি মুছে ফেলতে চান?')) return;

    try {
      await db.transaction('rw', [db.transactions, db.wallets], async () => {
        const wallet = await db.wallets.get(editTransaction.walletId);
        if (wallet) {
          if (editTransaction.type === 'expense') {
            await db.wallets.update(wallet.id, { balance: wallet.balance + editTransaction.amount });
          } else if (editTransaction.type === 'income') {
            await db.wallets.update(wallet.id, { balance: wallet.balance - editTransaction.amount });
          }
        }
        await db.transactions.delete(editTransaction.id);
      });
      onClose();
    } catch (err: any) {
      alert(`মুছে ফেলতে ত্রুটি: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {editTransaction ? t('editTransaction') : t('addTransaction')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Segmented Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('expense')}
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('income')}
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('transfer')}
            </button>
          </div>

          {/* Amount Input */}
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

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              বিবরণ / শিরোনাম *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: বন্ধুদের সাথে চা, মাছ, বাজার..."
              required
              className="w-full px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Category Selector (for Income & Expense) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {t('category')} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all text-xs font-semibold ${
                      categoryId === c.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate">{c.nameBn || c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallet Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {type === 'transfer' ? t('fromWallet') : t('wallet')} *
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

            {/* Target Wallet if Transfer, otherwise Payment Method */}
            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t('toWallet')} *
                </label>
                <select
                  value={targetWalletId}
                  onChange={(e) => setTargetWalletId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">নির্বাচন করুন</option>
                  {wallets
                    .filter((w) => w.id !== walletId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t('paymentMethod')}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="cash">ক্যাশ (Cash)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="bank">ব্যাংক (Bank)</option>
                  <option value="card">কার্ড (Card)</option>
                </select>
              </div>
            )}
          </div>

          {/* Date & Family Member */}
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
                {t('familyMember')}
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">সকলের / সাধারণ</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
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
              placeholder="ঐচ্ছিক কোনো বিশেষ মন্তব্য..."
              className="w-full px-4 py-2 text-xs font-medium text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            {editTransaction && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                {t('delete')}
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
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
