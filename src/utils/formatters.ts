/**
 * Persian number and currency formatting utilities
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(n: number | string): string {
  if (n === null || n === undefined) return '';
  return String(n).replace(/\d/g, (x) => PERSIAN_DIGITS[parseInt(x, 10)]);
}

export function formatCurrencyIRT(amount: number, usePersianDigits = true): string {
  if (isNaN(amount)) return '۰';
  const formatted = Math.round(amount).toLocaleString('en-US');
  return usePersianDigits ? toPersianDigits(formatted) : formatted;
}

export function formatCompactToman(amount: number, usePersianDigits = true): string {
  if (isNaN(amount) || amount === 0) return '۰';

  // Amount in IRT (Rials or Tomans depending on sheet convention; in Iran 10 IRT = 1 Toman or directly IRT)
  // Let's format nicely:
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000_000) {
    const val = (amount / 1_000_000_000_000).toFixed(2);
    return `${usePersianDigits ? toPersianDigits(val) : val} هزار میلیارد`;
  }
  if (abs >= 1_000_000_000) {
    const val = (amount / 1_000_000_000).toFixed(2);
    return `${usePersianDigits ? toPersianDigits(val) : val} میلیارد`;
  }
  if (abs >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1);
    return `${usePersianDigits ? toPersianDigits(val) : val} میلیون`;
  }
  if (abs >= 1_000) {
    const val = (amount / 1_000).toFixed(0);
    return `${usePersianDigits ? toPersianDigits(val) : val} هزار`;
  }
  return formatCurrencyIRT(amount, usePersianDigits);
}

export function formatPercent(val: number, usePersianDigits = true): string {
  if (isNaN(val)) return '۰٪';
  const formatted = val.toFixed(1) + '٪';
  return usePersianDigits ? toPersianDigits(formatted) : formatted;
}
