import { TranslationKey } from '../locales/bn';

export function getGreetingKey(): TranslationKey {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'greetingMorning';
  if (hour >= 12 && hour < 16) return 'greetingAfternoon';
  if (hour >= 16 && hour < 18) return 'greetingLateAfternoon';
  if (hour >= 18 && hour < 22) return 'greetingEvening';
  return 'greetingNight';
}

export function formatRelativeDate(dateStr: string, language: 'bn' | 'en' = 'bn'): string {
  const target = new Date(dateStr);
  const today = new Date();
  
  // Set both to midnight for pure day comparison
  const d1 = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return language === 'bn' ? 'আজ' : 'Today';
  }
  if (diffDays === 1) {
    return language === 'bn' ? 'গতকাল' : 'Yesterday';
  }
  if (diffDays === -1) {
    return language === 'bn' ? 'আগামীকাল' : 'Tomorrow';
  }

  // Format as DD Mon or localized
  if (language === 'bn') {
    const bengaliMonths = [
      'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
    ];
    return `${target.getDate()} ${bengaliMonths[target.getMonth()]}`;
  }

  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthDisplay(monthKey: string, language: 'bn' | 'en' = 'bn'): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  if (language === 'bn') {
    const bengaliMonthsFull = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    return `${bengaliMonthsFull[date.getMonth()]} ${year}`;
  }
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
