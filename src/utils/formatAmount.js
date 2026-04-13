/**
 * formatAmount — display a numeric amount with its actual decimal precision,
 * up to a maximum of 6 decimal places, trimming trailing zeros.
 *
 * Examples:
 *   100        → "100"
 *   100.5      → "100.5"
 *   100.50     → "100.5"
 *   100.123456 → "100.123456"
 *   100.1234567→ "100.123457"  (rounded at 6 dp)
 *
 * @param {number|string} amount
 * @param {number} [maxDecimals=6]
 * @returns {string}
 */
export const formatAmount = (amount, maxDecimals = 6) => {
  if (amount === null || amount === undefined || amount === '' || amount === '-')
    return '-';

  const num = parseFloat(amount);
  if (isNaN(num)) return '-';

  // toFixed(maxDecimals) then strip trailing zeros after the decimal point
  const fixed = num.toFixed(maxDecimals);
  // Remove trailing zeros but keep at least the integer part
  const trimmed = fixed.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  return trimmed;
};

/**
 * formatCurrencyAmount — same as formatAmount but prepends the currency code.
 *
 * @param {number|string} amount
 * @param {string} [currency='']
 * @param {number} [maxDecimals=6]
 * @returns {string}
 */
export const formatCurrencyAmount = (amount, currency = '', maxDecimals = 6) => {
  const formatted = formatAmount(amount, maxDecimals);
  if (formatted === '-') return '-';
  return currency ? `${currency} ${formatted}` : formatted;
};