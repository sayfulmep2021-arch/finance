export type TransactionType = 'income' | 'expense' | 'transfer';

export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'card' | 'other';

export interface WalletAccount {
  id: string;
  name: string;
  nameBn: string;
  type: 'main' | 'bank' | 'mfs' | 'cash';
  bankName?: string;
  accountNumber?: string;
  balance: number; // in integer cents/poisha or standard unit
  icon: string; // 'wallet' | 'bank' | 'bkash' | 'nagad' | 'cash'
  color: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string; // 'self' | 'spouse' | 'child' | 'parent' | 'other'
  avatarColor: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  bgLight: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // integer or decimal
  categoryId: string;
  categoryName: string;
  categoryNameBn: string;
  walletId: string;
  targetWalletId?: string; // for transfers
  memberId?: string; // Family member attribution
  title: string;
  date: string; // ISO date YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
  createdAt: string;
}

export type LoanType = 'lent' | 'borrowed'; // 'lent' = ধার দিয়েছি (receivable), 'borrowed' = ধার নিয়েছি (payable)
export type LoanStatus = 'active' | 'partially_paid' | 'settled' | 'overdue';

export interface LoanRepayment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  walletId: string;
  notes?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  type: LoanType;
  personName: string;
  personPhone?: string;
  amount: number; // original principal
  repaidAmount: number; // total repayments so far
  walletId: string; // wallet used
  date: string; // date given or taken
  dueDate?: string; // payment deadline
  notes?: string;
  status: LoanStatus;
  createdAt: string;
  memberId?: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  overallLimit: number;
  categoryLimits: Record<string, number>; // categoryId -> limit amount
  warningThresholdPercent: number; // e.g. 80%
  memberLimits?: Record<string, number>;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  color: string;
  icon: string;
  isCompleted?: boolean;
  createdAt: string;
  memberId?: string;
}

export interface AppSettings {
  id: string;
  userName: string;
  userAvatar?: string;
  currency: string; // 'BDT'
  currencySymbol: string; // '৳'
  language: 'bn' | 'en';
  theme: 'light' | 'dark' | 'system';
  useBengaliDigits: boolean;
  hasCompletedOnboarding: boolean;
  budgetWarningPercent: number;
}
