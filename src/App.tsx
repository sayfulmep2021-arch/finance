import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase } from './db';
import { I18nProvider } from './locales/i18nContext';
import { TabType, BottomNav } from './components/layout/BottomNav';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { TransactionsScreen } from './components/screens/TransactionsScreen';
import { LoansScreen } from './components/screens/LoansScreen';
import { BudgetScreen } from './components/screens/BudgetScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { AddLoanModal } from './components/modals/AddLoanModal';
import { QuickActionSheet } from './components/modals/QuickActionSheet';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { BackupRestoreModal } from './components/modals/BackupRestoreModal';
import { Transaction, TransactionType, WalletAccount, LoanType } from './types';
import { ToggleFilter } from './components/dashboard/IncomeExpenseToggle';

export const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeToggle, setActiveToggle] = useState<ToggleFilter>('expense'); // Matches screenshot default ("ব্যয়")
  const [dataVersion, setDataVersion] = useState<number>(0);

  // Modals state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [loanModalType, setLoanModalType] = useState<LoanType>('lent');

  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Initialize DB on first mount
  useEffect(() => {
    initializeDatabase().then(() => {
      setDataVersion((v) => v + 1);
    });
  }, []);

  // Reactive Dexie queries
  const wallets = useLiveQuery(() => db.wallets.toArray(), [dataVersion]) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray(), [dataVersion]) || [];
  const loans = useLiveQuery(() => db.loans.toArray(), [dataVersion]) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), [dataVersion]) || [];
  const members = useLiveQuery(() => db.familyMembers.toArray(), [dataVersion]) || [];
  const savingsGoals = useLiveQuery(() => db.savingsGoals.toArray(), [dataVersion]) || [];
  const settings = useLiveQuery(() => db.settings.get('app_settings'), [dataVersion]);

  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const budget = useLiveQuery(() => db.budgets.get(`budget_${currentMonthKey}`), [dataVersion]);

  const currencySymbol = settings?.currencySymbol || '৳';
  const useBengaliDigits = settings?.useBengaliDigits || false;
  const userName = settings?.userName || 'Shaikat';

  // Calculate current month expenses for budget and alerts
  const monthlyExpense = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthKey))
    .reduce((s, t) => s + t.amount, 0);

  const refreshData = () => {
    setDataVersion((v) => v + 1);
  };

  const handleOpenQuickAdd = (type?: 'expense' | 'income' | 'transfer' | 'loan' | 'savings') => {
    if (type === 'loan') {
      setLoanModalType('lent');
      setIsAddLoanOpen(true);
    } else if (type === 'savings') {
      setActiveTab('budget');
    } else {
      setEditingTransaction(null);
      setTxModalType(type || 'expense');
      setIsAddTxOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Phone Viewport Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 pb-8 bg-slate-50/50 dark:bg-slate-900/50 min-h-screen flex flex-col relative shadow-xl shadow-slate-200/50 dark:shadow-none">
        {/* Active Tab Screen */}
        {activeTab === 'home' && (
          <DashboardScreen
            userName={userName}
            avatarUrl={settings?.userAvatar}
            wallets={wallets}
            transactions={transactions}
            budget={budget}
            loans={loans}
            activeToggle={activeToggle}
            currencySymbol={currencySymbol}
            useBengaliDigits={useBengaliDigits}
            onToggleChange={(tab) => setActiveToggle(tab)}
            onSeeAllTransactions={() => setActiveTab('accounts')}
            onSelectTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsAddTxOpen(true);
            }}
            onSelectWallet={(w) => {
              // Open transfer or filtered transactions
              setActiveTab('accounts');
            }}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenSettings={() => setActiveTab('home' ? 'settings' : 'home')}
            onOpenQuickAdd={handleOpenQuickAdd}
          />
        )}

        {activeTab === 'accounts' && (
          <TransactionsScreen
            transactions={transactions}
            wallets={wallets}
            categories={categories}
            members={members}
            currencySymbol={currencySymbol}
            useBengaliDigits={useBengaliDigits}
            onSelectTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsAddTxOpen(true);
            }}
            onAddTransaction={() => handleOpenQuickAdd('expense')}
          />
        )}

        {activeTab === 'loans' && (
          <LoansScreen
            loans={loans}
            wallets={wallets}
            currencySymbol={currencySymbol}
            useBengaliDigits={useBengaliDigits}
            onOpenAddLoan={(type) => {
              setLoanModalType(type || 'lent');
              setIsAddLoanOpen(true);
            }}
            onDataChanged={refreshData}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetScreen
            budget={budget}
            transactions={transactions}
            categories={categories}
            savingsGoals={savingsGoals}
            currencySymbol={currencySymbol}
            useBengaliDigits={useBengaliDigits}
            onDataChanged={refreshData}
          />
        )}

        {activeTab === 'stats' && (
          <ReportsScreen
            transactions={transactions}
            categories={categories}
            members={members}
            currencySymbol={currencySymbol}
            useBengaliDigits={useBengaliDigits}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings || {
              id: 'app_settings',
              userName: 'Shaikat',
              currency: 'BDT',
              currencySymbol: '৳',
              language: 'bn',
              theme: 'light',
              useBengaliDigits: false,
              hasCompletedOnboarding: true,
              budgetWarningPercent: 80,
            }}
            members={members}
            onOpenBackupModal={() => setIsBackupOpen(true)}
            onDataChanged={refreshData}
          />
        )}

        {/* Bottom Navigation with FAB */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
          onOpenQuickAdd={() => setIsQuickActionOpen(true)}
        />
      </main>

      {/* Modals */}
      <QuickActionSheet
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={(action) => handleOpenQuickAdd(action)}
      />

      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => {
          setIsAddTxOpen(false);
          setEditingTransaction(null);
          refreshData();
        }}
        categories={categories}
        wallets={wallets}
        members={members}
        editTransaction={editingTransaction}
        initialType={txModalType}
      />

      <AddLoanModal
        isOpen={isAddLoanOpen}
        onClose={() => {
          setIsAddLoanOpen(false);
          refreshData();
        }}
        wallets={wallets}
        initialType={loanModalType}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        budget={budget}
        monthlyExpense={monthlyExpense}
        loans={loans}
        currencySymbol={currencySymbol}
      />

      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        transactions={transactions}
        onDataChanged={refreshData}
      />
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <MainApp />
    </I18nProvider>
  );
}
