import Dexie, { Table } from 'dexie';
import {
  Transaction,
  WalletAccount,
  FamilyMember,
  Category,
  Loan,
  LoanRepayment,
  Budget,
  SavingsGoal,
  AppSettings,
  UserImage,
} from '../types';

export class FinanceDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  wallets!: Table<WalletAccount, string>;
  familyMembers!: Table<FamilyMember, string>;
  categories!: Table<Category, string>;
  loans!: Table<Loan, string>;
  loanRepayments!: Table<LoanRepayment, string>;
  budgets!: Table<Budget, string>;
  savingsGoals!: Table<SavingsGoal, string>;
  settings!: Table<AppSettings, string>;
  userImages!: Table<UserImage, string>;

  constructor() {
    super('PersonalFinanceDB');
    this.version(1).stores({
      transactions: 'id, type, amount, categoryId, walletId, date, memberId, createdAt',
      wallets: 'id, name, type, isDefault',
      familyMembers: 'id, name, role',
      categories: 'id, name, type',
      loans: 'id, type, status, personName, date, dueDate',
      loanRepayments: 'id, loanId, date, walletId',
      budgets: 'id, month',
      savingsGoals: 'id, name, isCompleted',
      settings: 'id',
    });
    this.version(2).stores({
      userImages: 'id, createdAt, isPrimary',
    });
  }
}

export const db = new FinanceDatabase();

// Default initial categories
export const defaultCategories: Category[] = [
  {
    id: 'cat_tea',
    name: 'Tea & Snacks',
    nameBn: 'বন্ধুদের সাথে চা',
    type: 'expense',
    icon: 'coffee',
    color: '#F97316',
    bgLight: '#FFEDD5',
  },
  {
    id: 'cat_fish',
    name: 'Fish & Groceries',
    nameBn: 'মাছ',
    type: 'expense',
    icon: 'fish',
    color: '#8B5CF6',
    bgLight: '#EDE9FE',
  },
  {
    id: 'cat_shampoo',
    name: 'Personal Care',
    nameBn: 'শ্যাম্পু',
    type: 'expense',
    icon: 'spray-can',
    color: '#EC4899',
    bgLight: '#FCE7F3',
  },
  {
    id: 'cat_google_ai',
    name: 'Google AI Pro',
    nameBn: 'Google ai pro',
    type: 'expense',
    icon: 'bot',
    color: '#EF4444',
    bgLight: '#FEE2E2',
  },
  {
    id: 'cat_food',
    name: 'Food & Dining',
    nameBn: 'খাবার ও রেস্তোরাঁ',
    type: 'expense',
    icon: 'utensils',
    color: '#10B981',
    bgLight: '#D1FAE5',
  },
  {
    id: 'cat_rent',
    name: 'House Rent',
    nameBn: 'বাড়ি ভাড়া',
    type: 'expense',
    icon: 'home',
    color: '#3B82F6',
    bgLight: '#DBEAFE',
  },
  {
    id: 'cat_medical',
    name: 'Healthcare',
    nameBn: 'ওষুধ ও চিকিৎসা',
    type: 'expense',
    icon: 'heart-pulse',
    color: '#E11D48',
    bgLight: '#FFE4E6',
  },
  {
    id: 'cat_salary',
    name: 'Salary',
    nameBn: 'মাসিক বেতন',
    type: 'income',
    icon: 'briefcase',
    color: '#10B981',
    bgLight: '#D1FAE5',
  },
  {
    id: 'cat_freelance',
    name: 'Freelancing',
    nameBn: 'ফ্রিল্যান্সিং আয়',
    type: 'income',
    icon: 'laptop',
    color: '#06B6D4',
    bgLight: '#CFFAFE',
  },
  {
    id: 'cat_other_income',
    name: 'Other Income',
    nameBn: 'অন্যান্য আয়',
    type: 'income',
    icon: 'coins',
    color: '#F59E0B',
    bgLight: '#FEF3C7',
  },
];

// Clean database reset helper
export async function resetDatabaseToCleanState() {
  await db.transactions.clear();
  await db.loans.clear();
  await db.loanRepayments.clear();
  await db.budgets.clear();
  await db.savingsGoals.clear();

  // Reset all wallets to 0
  const allWallets = await db.wallets.toArray();
  for (const w of allWallets) {
    await db.wallets.update(w.id, { balance: 0 });
  }

  // Ensure default main wallet exists with 0 balance
  const mainWallet = await db.wallets.get('wallet_main');
  if (!mainWallet) {
    await db.wallets.add({
      id: 'wallet_main',
      name: 'Main Wallet',
      nameBn: 'মেইন ওয়ালেট',
      type: 'main',
      balance: 0,
      icon: 'wallet',
      color: '#2563EB',
      isDefault: true,
      createdAt: new Date().toISOString(),
    });
  }

  // Update settings with userName 'Sayful' and flag hasResetInitialData
  const currentSettings = await db.settings.get('app_settings');
  if (currentSettings) {
    await db.settings.update('app_settings', {
      userName: (!currentSettings.userName || currentSettings.userName === 'Shaikat') ? 'Sayful' : currentSettings.userName,
      hasResetInitialData: true,
    });
  }

  // Ensure Sayful family member exists
  const sayfulMember = await db.familyMembers.filter((m) => m.name === 'Sayful').first();
  if (!sayfulMember) {
    await db.familyMembers.add({
      id: 'member_sayful',
      name: 'Sayful',
      role: 'self',
      avatarColor: '#2563EB',
      createdAt: new Date().toISOString(),
    });
  }
}

// User Profile Image DB Helpers
export async function saveUserImage(dataUrl: string, name: string, size: number): Promise<UserImage> {
  const newImage: UserImage = {
    id: `img_${Date.now()}`,
    dataUrl,
    name,
    size,
    createdAt: new Date().toISOString(),
    isPrimary: true,
  };
  // Demote previous primary images
  await db.userImages.toCollection().modify({ isPrimary: false });
  await db.userImages.add(newImage);
  await db.settings.update('app_settings', { userAvatar: dataUrl });
  return newImage;
}

export async function deleteUserImage(id?: string): Promise<void> {
  if (id) {
    await db.userImages.delete(id);
  } else {
    await db.userImages.clear();
  }
  const remaining = await db.userImages.orderBy('createdAt').reverse().first();
  if (remaining) {
    await db.userImages.update(remaining.id, { isPrimary: true });
    await db.settings.update('app_settings', { userAvatar: remaining.dataUrl });
  } else {
    await db.settings.update('app_settings', { userAvatar: undefined });
  }
}

// Initialize database with clean ledger and ensure one-time reset migration
export async function initializeDatabase() {
  const settingsCount = await db.settings.count();

  if (settingsCount === 0) {
    // 1. Fresh installation: Seed settings with Sayful and clean ledger
    await db.settings.add({
      id: 'app_settings',
      userName: 'Sayful',
      currency: 'BDT',
      currencySymbol: '৳',
      language: 'bn',
      theme: 'light',
      useBengaliDigits: false,
      hasCompletedOnboarding: true,
      budgetWarningPercent: 80,
      hasResetInitialData: true,
    });

    // Seed Family Members with Sayful
    await db.familyMembers.bulkAdd([
      {
        id: 'member_sayful',
        name: 'Sayful',
        role: 'self',
        avatarColor: '#2563EB',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'member_family',
        name: 'পরিবার',
        role: 'other',
        avatarColor: '#10B981',
        createdAt: new Date().toISOString(),
      },
    ]);

    // Seed Main Wallet with 0 balance
    await db.wallets.bulkAdd([
      {
        id: 'wallet_main',
        name: 'Main Wallet',
        nameBn: 'মেইন ওয়ালেট',
        type: 'main',
        balance: 0,
        icon: 'wallet',
        color: '#2563EB',
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    // Seed default categories
    await db.categories.bulkAdd(defaultCategories);
    return;
  }

  // 2. Existing installation: Run one-time migration to clear demo data if not yet reset
  const currentSettings = await db.settings.get('app_settings');
  if (!currentSettings?.hasResetInitialData) {
    await resetDatabaseToCleanState();
  }
}
