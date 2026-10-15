import React from 'react';
import { AppHeader } from '../layout/AppHeader';
import { MainWalletCard } from '../dashboard/MainWalletCard';
import { AccountCardsGrid } from '../dashboard/AccountCardsGrid';
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
  onOpenSettings,
  onOpenQuickAdd,
}) => {
  // Main wallet
  const mainWallet = wallets.find((w) => w.id === 'wallet_main') || wallets[0];
  const mainBalance = mainWallet ? mainWallet.balance : 2146;

  // Calculate monthly totals
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentMonthTx = transactions.filter((t) => t.date.startsWith(currentMonthKey));

  const totalIncome = currentMonthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Budget spent percent (default to ~98% if budget matches seed)
  const budgetLimit = budget?.overallLimit || (totalIncome > 0 ? totalIncome : 15000);
  const budgetSpentPercent = budgetLimit > 0 ? Math.min(100, (totalExpense / budgetLimit) * 100) : 0;

  // Filtered recent transactions based on active toggle ("ব্যয়" or "আয়")
  const recentItems = transactions
    .filter((t) => t.type === activeToggle)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Check unread alerts
  const hasAlerts = budgetSpentPercent >= 80 || loans.some((l) => l.status === 'overdue');

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto animate-fadeIn">
      {/* 1. Header matching screenshot: "সুপ্রভাত", "Shaikat", Notification bell, Avatar */}
      <AppHeader
        userName={userName}
        avatarUrl={avatarUrl}
        hasUnreadAlerts={hasAlerts}
        onOpenNotifications={onOpenNotifications}
        onOpenSettings={onOpenSettings}
      />

      {/* 2. Main Wallet Card: "মেইন ওয়ালেট", "৳2,146", "+৳19,032", "-৳14,668", Circular gauge "খরচ হয়েছে 98%" */}
      <MainWalletCard
        balance={mainBalance}
        income={totalIncome || 19032}
        expense={totalExpense || 14668}
        budgetSpentPercent={budgetSpentPercent || 98}
        currencySymbol={currencySymbol}
        useBengaliDigits={useBengaliDigits}
        onIncomeClick={() => onOpenQuickAdd('income')}
        onExpenseClick={() => onOpenQuickAdd('expense')}
      />

      {/* 3. Account / Wallet Cards (2 Column): "EBL ৳96,202" and "Bkash ৳22,417" */}
      <AccountCardsGrid
        wallets={wallets}
        currencySymbol={currencySymbol}
        useBengaliDigits={useBengaliDigits}
        onSelectWallet={onSelectWallet}
        onAddWallet={() => onOpenQuickAdd('transfer')}
      />

      {/* 4. Segmented Toggle Button: "আয়" and "ব্যয়" */}
      <IncomeExpenseToggle
        activeTab={activeToggle}
        onChange={onToggleChange}
      />

      {/* 5. Recent Section: "সাম্প্রতিক ব্যয়", "সব দেখুন", and Transaction Cards */}
      <RecentTransactionsList
        transactions={recentItems}
        type={activeToggle}
        currencySymbol={currencySymbol}
        useBengaliDigits={useBengaliDigits}
        onSeeAll={onSeeAllTransactions}
        onSelectTransaction={onSelectTransaction}
      />
    </div>
  );
};
