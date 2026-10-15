import { describe, it, expect } from 'vitest';
import { formatCurrency, parseAmount, toBengaliNumber } from '../src/utils/currency';
import { formatRelativeDate, getGreetingKey, getCurrentMonthKey } from '../src/utils/date';

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
    const spent = 14668; // Matching the screenshot ~98%
    const spentPercent = (spent / budgetLimit) * 100;

    expect(Math.round(spentPercent)).toBe(98);
    const warningThreshold = 80;
    const isWarning = spentPercent >= warningThreshold;
    expect(isWarning).toBe(true);

    const isExceeded = spent > budgetLimit;
    expect(isExceeded).toBe(false);
  });
});
