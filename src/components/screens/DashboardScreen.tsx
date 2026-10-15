import React from 'react';
import { AppHeader } from '../layout/AppHeader';
import { MainWalletCard } from '../dashboard/MainWalletCard';
import { IncomeExpenseToggle, ToggleFilter } from '../dashboard/IncomeExpenseToggle';
import { RecentTransactionsList } from '../dashboard/RecentTransactionsList';
import { Transaction, WalletAccount, Budget, Loan } from '../../types';

interface DashboardScreenProps {
  userName: string;
  avatarUrl?: string;
  wallets: WalletAccount[];
  transactions: Transaction[];
  budget?: Budget;
  loans: Loan[];
  activeToggle: ToggleFilter;
  currencySymbol: string;
  useBengaliDigits: boolean;
  onToggleChange: (tab: ToggleFilter) => void;
  onSeeAllTransactions: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onSelectWallet: (wallet: WalletAccount) => void;
  onOpenNotifications: () => void;
  onOpenUserImage: () => void;
  onOpenSettings: () => void;
  onOpenQuickAdd: (type?: any) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userName,
  avatarUrl,
  wallets,
  transactions,
  budget,
  loans,
  activeToggle,
  currencySymbol,
  useBengaliDigits,
  onToggleChange,
  onSeeAllTransactions,
  onSelectTransaction,
  onSelectWallet,
  onOpenNotifications,
  onOpenUserImage,
  onOpenSettings,
  onOpenQuickAdd,
}) => {
  // Main wallet
  const mainWallet = wallets.find((w) => w.id === 'wallet_main') || wallets[0];
  const mainBalance = mainWallet ? mainWallet.balance : 0;

  // Calculate monthly totals
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentMonthTx = transactions.filter((t) => t.date.startsWith(currentMonthKey));

  const totalIncome = currentMonthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Budget spent percent (0% if clean/no expense)
  const budgetLimit = budget?.overallLimit || (totalIncome > 0 ? totalIncome : 0);
  const budgetSpentPercent = budgetLimit > 0 ? Math.min(100, Math.round((totalExpense / budgetLimit) * 100)) : 0;

  // Filtered recent transactions based on active toggle ("ব্যয়" or "আয়")
  const recentItems = transactions
    .filter((t) => t.type === activeToggle)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Check unread alerts
  const hasAlerts = (budgetLimit > 0 && budgetSpentPercent >= 80) || loans.some((l) => l.status === 'overdue');

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto animate-fadeIn">
      {/* 1. Header: Sayful (Location 4), Smart Wallet System (Location 1), Bell (Location 3), Avatar (Location 2) */}
      <AppHeader
        userName={userName}
        avatarUrl={avatarUrl}
        hasUnreadAlerts={hasAlerts}
        onOpenNotifications={onOpenNotifications}
        onOpenUserImage={onOpenUserImage}
        onOpenSettings={onOpenSettings}
      />

      {/* 2. Main Wallet Card: Main Wallet, ৳0, +৳0, -৳0, Circular gauge 0% */}
      <MainWalletCard
        balance={mainBalance}
        income={totalIncome}
        expense={totalExpense}
        budgetSpentPercent={budgetSpentPercent}
        currencySymbol={currencySymbol}
        useBengaliDigits={useBengaliDigits}
        onIncomeClick={() => onOpenQuickAdd('income')}
        onExpenseClick={() => onOpenQuickAdd('expense')}
      />

      {/* Note: The 2-column secondary wallet cards (Bkash and EBL cards) have been completely removed as requested */}

      {/* 3. Segmented Toggle Button: "আয়" and "ব্যয়" */}
      <IncomeExpenseToggle
        activeTab={activeToggle}
        onChange={onToggleChange}
      />

      {/* 4. Recent Section: "সাম্প্রতিক ব্যয়" / "সাম্প্রতিক আয়", "সব দেখুন", and Transaction Cards */}
      <RecentTransactionsList
        transactions={recentItems}
        type={activeToggle}
        currencySymbol={currencySymbol}
        useBengaliDigits={useBengaliDigits}
        onSeeAll={onSeeAllTransactions}
        onSelectTransaction={onSelectTransaction}
        onAddTransaction={() => onOpenQuickAdd(activeToggle)}
      />
    </div>
  );
};

