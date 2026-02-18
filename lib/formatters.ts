// =====================================================
// Imperoyal Immobilien - Formatters
// =====================================================

/**
 * Format a number as German currency (EUR)
 * @param val - Number to format
 * @returns Formatted currency string or '-' if null/undefined
 */
export const formatCurrency = (val: number | null | undefined): string =>
  val == null
    ? '-'
    : new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(val);

/**
 * Format a number as German currency with decimals
 * @param val - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string or '-' if null/undefined
 */
export const formatCurrencyDecimal = (
  val: number | null | undefined,
  decimals = 2
): string =>
  val == null
    ? '-'
    : new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(val);

/**
 * Format a number as percentage
 * @param val - Number to format (already in percent, e.g., 5.5 for 5.5%)
 * @param digits - Decimal places (default: 2)
 * @returns Formatted percentage string or '-' if null/undefined
 */
export const formatPercent = (
  val: number | null | undefined,
  digits = 2
): string => (val != null ? `${val.toFixed(digits)}%` : '-');

/**
 * Format a date as German date string
 * @param d - Date string or Date object
 * @returns Formatted date string or '-' if null/undefined
 */
export const formatDate = (d: string | Date | null | undefined): string =>
  d ? new Date(d).toLocaleDateString('de-DE') : '-';

/**
 * Format a date as German date + time string (e.g. "18.02.2026, 14:35")
 * @param d - Date string or Date object
 * @returns Formatted date/time string or '-' if null/undefined
 */
export const formatDateTime = (d: string | Date | null | undefined): string =>
  d ? new Date(d).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

/**
 * Format a number with German locale (thousand separators)
 * @param val - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string or '-' if null/undefined
 */
export const formatNumber = (
  val: number | null | undefined,
  decimals = 0
): string =>
  val == null
    ? '-'
    : new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(val);

/**
 * Format square meters
 * @param val - Number to format
 * @returns Formatted string with m² suffix or '-' if null/undefined
 */
export const formatArea = (val: number | null | undefined): string =>
  val == null ? '-' : `${formatNumber(val, 2)} m²`;

/**
 * Format currency per square meter
 * @param val - Number to format
 * @returns Formatted string with €/m² suffix or '-' if null/undefined
 */
export const formatCurrencyPerSqm = (val: number | null | undefined): string =>
  val == null ? '-' : `${formatNumber(val, 2)} €/m²`;

/**
 * Convert boolean to German Ja/Nein string
 * @param val - Boolean value
 * @returns 'Ja' or 'Nein'
 */
export const formatBoolean = (val: boolean | null | undefined): string => {
  if (val == null) return '-';
  return val ? 'Ja' : 'Nein';
};

/**
 * Parse German Ja/Nein string to boolean
 * @param val - String 'Ja' or 'Nein'
 * @returns boolean
 */
export const parseBoolean = (val: string | null | undefined): boolean => {
  return val === 'Ja';
};

/**
 * Format a full address
 * @param strasse - Street
 * @param plz - Postal code
 * @param ort - City
 * @returns Formatted address string
 */
export const formatAddress = (
  strasse: string | null | undefined,
  plz: string | null | undefined,
  ort: string | null | undefined
): string => {
  const parts = [strasse, [plz, ort].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
  return parts || '-';
};

/**
 * Format month/year for display
 * @param d - Date string or Date object
 * @returns Formatted month/year string or '-' if null/undefined
 */
export const formatMonthYear = (d: string | Date | null | undefined): string =>
  d
    ? new Date(d).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    : '-';

/**
 * Get the year from a date
 * @param d - Date string or Date object
 * @returns Year as number or null
 */
export const getYear = (d: string | Date | null | undefined): number | null =>
  d ? new Date(d).getFullYear() : null;

/**
 * Calculate months between two dates
 * @param from - Start date
 * @param to - End date (defaults to now)
 * @returns Number of months
 */
export const monthsBetween = (
  from: string | Date,
  to: string | Date = new Date()
): number => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  return (
    (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
    (toDate.getMonth() - fromDate.getMonth())
  );
};

/**
 * Add months to a date
 * @param date - Start date
 * @param months - Number of months to add
 * @returns New date
 */
export const addMonths = (date: string | Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};
