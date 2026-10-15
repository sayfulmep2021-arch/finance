import { db } from '../db';
import { Transaction } from '../types';

export interface BackupData {
  version: number;
  exportedAt: string;
  transactions: any[];
  wallets: any[];
  familyMembers: any[];
  categories: any[];
  loans: any[];
  loanRepayments: any[];
  budgets: any[];
  savingsGoals: any[];
  settings: any[];
}

export async function exportFullBackup(): Promise<string> {
  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions: await db.transactions.toArray(),
    wallets: await db.wallets.toArray(),
    familyMembers: await db.familyMembers.toArray(),
    categories: await db.categories.toArray(),
    loans: await db.loans.toArray(),
    loanRepayments: await db.loanRepayments.toArray(),
    budgets: await db.budgets.toArray(),
    savingsGoals: await db.savingsGoals.toArray(),
    settings: await db.settings.toArray(),
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `personal_finance_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return jsonStr;
}

export function exportTransactionsCsv(transactions: Transaction[]): void {
  const headers = ['Date', 'Type', 'Category', 'Amount (BDT)', 'Title', 'Payment Method', 'Notes'];
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    `"${t.categoryNameBn || t.categoryName || ''}"`,
    t.amount,
    `"${t.title.replace(/"/g, '""')}"`,
    t.paymentMethod,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(
  jsonContent: string,
  mode: 'replace' | 'merge' = 'replace'
): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonContent);
    if (!data.version || !Array.isArray(data.transactions) || !Array.isArray(data.wallets)) {
      return { success: false, message: 'অকার্যকর ব্যাকআপ ফাইল (Invalid backup format)' };
    }

    if (mode === 'replace') {
      await db.transaction(
        'rw',
        [
          db.transactions,
          db.wallets,
          db.familyMembers,
          db.categories,
          db.loans,
          db.loanRepayments,
          db.budgets,
          db.savingsGoals,
          db.settings,
        ],
        async () => {
          await db.transactions.clear();
          await db.wallets.clear();
          await db.familyMembers.clear();
          await db.categories.clear();
          await db.loans.clear();
          await db.loanRepayments.clear();
          await db.budgets.clear();
          await db.savingsGoals.clear();
          await db.settings.clear();

          if (data.transactions.length) await db.transactions.bulkAdd(data.transactions);
          if (data.wallets.length) await db.wallets.bulkAdd(data.wallets);
          if (data.familyMembers?.length) await db.familyMembers.bulkAdd(data.familyMembers);
          if (data.categories?.length) await db.categories.bulkAdd(data.categories);
          if (data.loans?.length) await db.loans.bulkAdd(data.loans);
          if (data.loanRepayments?.length) await db.loanRepayments.bulkAdd(data.loanRepayments);
          if (data.budgets?.length) await db.budgets.bulkAdd(data.budgets);
          if (data.savingsGoals?.length) await db.savingsGoals.bulkAdd(data.savingsGoals);
          if (data.settings?.length) await db.settings.bulkAdd(data.settings);
        }
      );
    } else {
      // Merge mode
      if (data.transactions.length) await db.transactions.bulkPut(data.transactions);
      if (data.wallets.length) await db.wallets.bulkPut(data.wallets);
      if (data.familyMembers?.length) await db.familyMembers.bulkPut(data.familyMembers);
      if (data.categories?.length) await db.categories.bulkPut(data.categories);
      if (data.loans?.length) await db.loans.bulkPut(data.loans);
      if (data.loanRepayments?.length) await db.loanRepayments.bulkPut(data.loanRepayments);
      if (data.budgets?.length) await db.budgets.bulkPut(data.budgets);
      if (data.savingsGoals?.length) await db.savingsGoals.bulkPut(data.savingsGoals);
    }

    return { success: true, message: 'সফলভাবে ব্যাকআপ রিস্টোর সম্পন্ন হয়েছে' };
  } catch (err: any) {
    return { success: false, message: `রিস্টোর ত্রুটি: ${err.message || 'অজানা ত্রুটি'}` };
  }
}

export async function resetAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.transactions,
      db.wallets,
      db.familyMembers,
      db.categories,
      db.loans,
      db.loanRepayments,
      db.budgets,
      db.savingsGoals,
      db.settings,
    ],
    async () => {
      await db.transactions.clear();
      await db.wallets.clear();
      await db.familyMembers.clear();
      await db.categories.clear();
      await db.loans.clear();
      await db.loanRepayments.clear();
      await db.budgets.clear();
      await db.savingsGoals.clear();
      await db.settings.clear();
    }
  );
}
