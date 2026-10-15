const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(val: number | string): string {
  return String(val).replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)]);
}

export function formatCurrency(
  amount: number,
  currencySymbol: string = '৳',
  useBengaliDigits: boolean = false
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with standard thousands separator
  const formattedEnglish = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(absAmount);

  let formatted = formattedEnglish;
  if (useBengaliDigits) {
    formatted = toBengaliNumber(formattedEnglish);
  }

  const sign = isNegative ? '-' : '';
  return `${sign}${currencySymbol}${formatted}`;
}

export function parseAmount(input: string | number): number {
  if (typeof input === 'number') return Math.max(0, input);
  
  // Convert any Bengali digits to standard English digits first
  let englishStr = input.replace(/[০-৯]/g, (d) => {
    return String(bengaliDigits.indexOf(d));
  });

  // Strip anything that is not a digit or decimal point
  englishStr = englishStr.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(englishStr);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}
