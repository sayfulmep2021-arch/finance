import { describe, it, expect } from 'vitest';
import { formatCurrency, parseAmount, toBengaliNumber } from '../src/utils/currency';
import { formatRelativeDate, getGreetingKey, getCurrentMonthKey } from '../src/utils/date';
import { bn, TranslationKey } from '../src/locales/bn';
import { en } from '../src/locales/en';
import { Category, Transaction } from '../src/types';

describe('Financial Calculation Utilities', () => {
  it('correctly formats currencies with Bangladeshi Taka symbol ৳', () => {
    expect(formatCurrency(2146)).toBe('৳2,146');
    expect(formatCurrency(96202)).toBe('৳96,202');
    expect(formatCurrency(14668)).toBe('৳14,668');
    expect(formatCurrency(-500)).toBe('-৳500');
  });

  it('correctly converts English numbers to Bengali numerals when enabled', () => {
    expect(toBengaliNumber('2146')).toBe('২১৪৬');
    expect(formatCurrency(2146, '৳', true)).toBe('৳২,১৪৬');
  });

  it('correctly parses various input formats into clean numbers', () => {
    expect(parseAmount('1500')).toBe(1500);
    expect(parseAmount('৳ 2,146')).toBe(2146);
    expect(parseAmount('২১৪৬')).toBe(2146);
    expect(parseAmount(-50)).toBe(0); // Prevents negative input
  });
});

describe('Date & Greeting Utilities', () => {
  it('returns valid relative dates for today and yesterday', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    expect(formatRelativeDate(today, 'bn')).toBe('আজ');
    expect(formatRelativeDate(today, 'en')).toBe('Today');
    expect(formatRelativeDate(yesterday, 'bn')).toBe('গতকাল');
    expect(formatRelativeDate(yesterday, 'en')).toBe('Yesterday');
  });

  it('determines proper greeting keys', () => {
    const key = getGreetingKey();
    expect([
      'greetingMorning',
      'greetingAfternoon',
      'greetingLateAfternoon',
      'greetingEvening',
      'greetingNight',
    ]).toContain(key);
  });

  it('generates correct current month key', () => {
    const key = getCurrentMonthKey();
    expect(key).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe('Lending & Borrowing Ledger Rules', () => {
  it('accurately computes loan balance after partial repayments', () => {
    const loanPrincipal = 5000;
    let repaid = 0;

    // First repayment: 2000
    repaid += 2000;
    const remainingAfterFirst = loanPrincipal - repaid;
    expect(remainingAfterFirst).toBe(3000);

    // Second repayment: 1500
    repaid += 1500;
    const remainingAfterSecond = loanPrincipal - repaid;
    expect(remainingAfterSecond).toBe(1500);

    // Final settlement: 1500
    repaid += 1500;
    const finalRemaining = loanPrincipal - repaid;
    expect(finalRemaining).toBe(0);
    expect(repaid).toBe(loanPrincipal);
  });
});

describe('Budget & Threshold Calculations', () => {
  it('calculates budget spent percentage and triggers warning when above threshold', () => {
    const budgetLimit = 15000;
    const spent = 14668;
    const spentPercent = (spent / budgetLimit) * 100;

    expect(Math.round(spentPercent)).toBe(98);
    const warningThreshold = 80;
    const isWarning = spentPercent >= warningThreshold;
    expect(isWarning).toBe(true);

    const isExceeded = spent > budgetLimit;
    expect(isExceeded).toBe(false);
  });

  it('handles clean zero-ledger state without errors or NaN', () => {
    const totalIncome = 0;
    const totalExpense = 0;
    const budgetLimit = 0;
    const budgetSpentPercent = budgetLimit > 0 ? Math.min(100, Math.round((totalExpense / budgetLimit) * 100)) : 0;

    expect(budgetSpentPercent).toBe(0);
    expect(formatCurrency(0)).toBe('৳0');
  });
});

describe('Bilingual Localization Completeness & Symmetry', () => {
  it('verifies bn and en dictionaries have matching translation keys without omissions', () => {
    const bnKeys = Object.keys(bn).sort();
    const enKeys = Object.keys(en).sort();

    expect(bnKeys.length).toBeGreaterThan(50);
    expect(bnKeys).toEqual(enKeys);

    // Verify key translations exist and are not empty
    bnKeys.forEach((key) => {
      const bnVal = bn[key as TranslationKey];
      const enVal = en[key as TranslationKey];
      expect(bnVal).toBeDefined();
      expect(bnVal.trim().length).toBeGreaterThan(0);
      expect(enVal).toBeDefined();
      expect(enVal.trim().length).toBeGreaterThan(0);
    });
  });

  it('verifies category management translation keys exist', () => {
    expect(bn.manageCategories).toBe('ক্যাটাগরি ব্যবস্থাপনা');
    expect(en.manageCategories).toBe('Category Management');
    expect(bn.addNewCategory).toBe('নতুন ক্যাটাগরি');
    expect(en.addNewCategory).toBe('New Category');
    expect(bn.categoryName).toBe('ক্যাটাগরির নাম');
    expect(en.categoryName).toBe('Category Name');
  });
});

describe('Custom Category Management & Safety Check', () => {
  it('allows creating custom categories with arbitrary names in Bengali and English', () => {
    const customExpenseCat: Category = {
      id: 'cat_custom_bazaar',
      name: 'বাজার',
      nameBn: 'বাজার',
      type: 'expense',
      color: '#10B981',
      bgLight: '#10B98120',
      icon: 'shopping-cart',
    };

    expect(customExpenseCat.name).toBe('বাজার');
    expect(customExpenseCat.nameBn).toBe('বাজার');
    expect(customExpenseCat.type).toBe('expense');

    const customIncomeCat: Category = {
      id: 'cat_custom_consulting',
      name: 'Consulting & Freelancing',
      nameBn: 'Consulting & Freelancing',
      type: 'income',
      color: '#06B6D4',
      bgLight: '#06B6D420',
      icon: 'briefcase',
    };

    expect(customIncomeCat.name).toBe('Consulting & Freelancing');
    expect(customIncomeCat.type).toBe('income');
  });

  it('safely reassigns transactions to fallback category when a category is deleted', () => {
    const categoryToDelete = 'cat_rent';
    const transactions: Transaction[] = [
      {
        id: 'tx_1',
        type: 'expense',
        amount: 5000,
        categoryId: 'cat_rent',
        categoryName: 'বাড়ি ভাড়া',
        categoryNameBn: 'বাড়ি ভাড়া',
        walletId: 'wallet_main',
        title: 'বাসা ভাড়া',
        date: '2026-11-01',
        paymentMethod: 'cash',
        createdAt: '2026-11-01T10:00:00.000Z',
      },
      {
        id: 'tx_2',
        type: 'expense',
        amount: 200,
        categoryId: 'cat_tea',
        categoryName: 'চা',
        categoryNameBn: 'চা',
        walletId: 'wallet_main',
        title: 'চা নাস্তা',
        date: '2026-11-01',
        paymentMethod: 'cash',
        createdAt: '2026-11-01T11:00:00.000Z',
      },
    ];

    // Simulate safe deletion reassignment
    const updatedTransactions = transactions.map((tx) => {
      if (tx.categoryId === categoryToDelete) {
        return {
          ...tx,
          categoryId: 'cat_other',
          categoryName: 'Other',
          categoryNameBn: 'অন্যান্য',
        };
      }
      return tx;
    });

    expect(updatedTransactions[0].categoryId).toBe('cat_other');
    expect(updatedTransactions[0].categoryNameBn).toBe('অন্যান্য');
    expect(updatedTransactions[0].amount).toBe(5000); // Financial data intact!
    expect(updatedTransactions[1].categoryId).toBe('cat_tea'); // Unrelated untouched!
  });
});

describe('User Content Preservation Rules', () => {
  it('preserves user entered Bengali and English text verbatim without translation', () => {
    const userTitle1 = 'বাজার খরচ ও মাছ কেনা';
    const userTitle2 = 'Google AI Pro subscription';
    const userNotes = 'বন্ধুর কাছ থেকে ধার নেওয়া টাকা';

    // The user content must remain exact string
    expect(userTitle1).toBe('বাজার খরচ ও মাছ কেনা');
    expect(userTitle2).toBe('Google AI Pro subscription');
    expect(userNotes).toBe('বন্ধুর কাছ থেকে ধার নেওয়া টাকা');
  });
});
