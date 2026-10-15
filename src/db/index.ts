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

// Initialize and seed default database state matching the user's uploaded mockup
export async function initializeDatabase() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    // Seed App Settings
    await db.settings.add({
      id: 'app_settings',
      userName: 'Shaikat',
      currency: 'BDT',
      currencySymbol: '৳',
      language: 'bn',
      theme: 'light',
      useBengaliDigits: false,
      hasCompletedOnboarding: true,
      budgetWarningPercent: 80,
    });

    // Seed Family Members
    const shaikatId = 'member_shaikat';
    await db.familyMembers.bulkAdd([
      {
        id: shaikatId,
        name: 'Shaikat',
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

    // Seed Wallets matching image: Main Wallet (৳2,146), EBL (৳96,202), Bkash (৳22,417)
    await db.wallets.bulkAdd([
      {
        id: 'wallet_main',
        name: 'Main Wallet',
        nameBn: 'মেইন ওয়ালেট',
        type: 'main',
        balance: 2146,
        icon: 'wallet',
        color: '#2563EB',
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'wallet_ebl',
        name: 'EBL',
        nameBn: 'EBL',
        type: 'bank',
        bankName: 'Eastern Bank Ltd',
        balance: 96202,
        icon: 'credit-card',
        color: '#0066B2',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'wallet_bkash',
        name: 'Bkash',
        nameBn: 'Bkash',
        type: 'mfs',
        balance: 22417,
        icon: 'smartphone',
        color: '#E2136E',
        createdAt: new Date().toISOString(),
      },
    ]);

    // Seed Categories
    await db.categories.bulkAdd(defaultCategories);

    // Current month dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Seed Transactions matching screenshot items:
    // Income: +৳19,032
    // Expense: -৳14,668
    // Result balance: ৳4,364 / adjusted to ৳2,146
    await db.transactions.bulkAdd([
      {
        id: 'tx_inc_salary',
        type: 'income',
        amount: 19032,
        categoryId: 'cat_salary',
        categoryName: 'Salary',
        categoryNameBn: 'মাসিক বেতন',
        walletId: 'wallet_main',
        memberId: shaikatId,
        title: 'অক্টোবর মাসের বেতন',
        date: `${monthKey}-01`,
        paymentMethod: 'bank',
        createdAt: `${monthKey}-01T09:00:00Z`,
      },
      {
        id: 'tx_exp_groceries_prev',
        type: 'expense',
        amount: 12718,
        categoryId: 'cat_food',
        categoryName: 'Food & Dining',
        categoryNameBn: 'মাসিক বাজার ও পারিবারিক খরচ',
        walletId: 'wallet_main',
        memberId: shaikatId,
        title: 'মাসিক পারিবারিক বাজার',
        date: `${monthKey}-05`,
        paymentMethod: 'cash',
        createdAt: `${monthKey}-05T14:00:00Z`,
      },
      {
        id: 'tx_exp_google',
        type: 'expense',
        amount: 250,
        categoryId: 'cat_google_ai',
        categoryName: 'Google AI Pro',
        categoryNameBn: 'Google ai pro',
        walletId: 'wallet_main',
        memberId: shaikatId,
        title: 'Google ai pro',
        date: yesterdayStr,
        paymentMethod: 'card',
        createdAt: `${yesterdayStr}T18:00:00Z`,
      },
      {
        id: 'tx_exp_shampoo',
        type: 'expense',
        amount: 40,
        categoryId: 'cat_shampoo',
        categoryName: 'Personal Care',
        categoryNameBn: 'শ্যাম্পু',
        walletId: 'wallet_main',
        memberId: shaikatId,
        title: 'শ্যাম্পু',
        date: yesterdayStr,
        paymentMethod: 'cash',
        createdAt: `${yesterdayStr}T15:30:00Z`,
      },
      {
        id: 'tx_exp_fish',
        type: 'expense',
        amount: 1500,
        categoryId: 'cat_fish',
        categoryName: 'Fish & Groceries',
        categoryNameBn: 'মাছ',
        walletId: 'wallet_main',
        memberId: shaikatId,
        title: 'মাছ',
        date: todayStr,
        paymentMethod: 'cash',
        createdAt: `${todayStr}T10:15:00Z`,
      },
      {
        id: 'tx_exp_tea',
        type: 'expense',
        amount: 160,
        categoryId: 'cat_tea',
        categoryName: 'Tea & Snacks',
        categoryNameBn: 'বন্ধুদের সাথে চা',
        walletId: 'wallet_main',
        memberId: shaikatId,
        title: 'বন্ধুদের সাথে চা',
        date: todayStr,
        paymentMethod: 'bkash',
        createdAt: `${todayStr}T11:45:00Z`,
      },
    ]);

    // Seed Budget: ৳15,000 monthly limit (with ৳14,668 spent = 97.8% ~ 98%, exact match!)
    await db.budgets.add({
      id: `budget_${monthKey}`,
      month: monthKey,
      overallLimit: 15000,
      categoryLimits: {
        cat_tea: 1500,
        cat_fish: 5000,
        cat_food: 13000,
        cat_google_ai: 500,
      },
      warningThresholdPercent: 80,
      updatedAt: new Date().toISOString(),
    });

    // Seed sample loan and savings goals
    await db.loans.bulkAdd([
      {
        id: 'loan_1',
        type: 'lent',
        personName: 'আরিফ ভাই',
        personPhone: '01712345678',
        amount: 5000,
        repaidAmount: 2000,
        walletId: 'wallet_bkash',
        date: `${monthKey}-02`,
        dueDate: `${monthKey}-28`,
        notes: 'জরুরি প্রয়োজনে দিয়েছি',
        status: 'partially_paid',
        createdAt: `${monthKey}-02T12:00:00Z`,
      },
      {
        id: 'loan_2',
        type: 'borrowed',
        personName: 'রাকিব আহমেদ',
        personPhone: '01898765432',
        amount: 3000,
        repaidAmount: 0,
        walletId: 'wallet_main',
        date: `${monthKey}-04`,
        dueDate: `${monthKey}-25`,
        notes: 'অফিসের কাজে নিয়েছিলাম',
        status: 'active',
        createdAt: `${monthKey}-04T16:00:00Z`,
      },
    ]);

    await db.savingsGoals.bulkAdd([
      {
        id: 'goal_emergency',
        name: 'জরুরি ফান্ড (Emergency)',
        targetAmount: 50000,
        currentAmount: 25000,
        targetDate: `${today.getFullYear()}-12-31`,
        color: '#10B981',
        icon: 'shield-check',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'goal_tour',
        name: 'সাজেক ট্যুর সঞ্চয়',
        targetAmount: 15000,
        currentAmount: 9500,
        targetDate: `${today.getFullYear()}-11-30`,
        color: '#F59E0B',
        icon: 'compass',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }
}
