/**
 * Centralized currency utilities for Symphony Training Centre
 * Supports BDT (Bangladeshi Taka) as primary currency
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  BDT: {
    code: 'BDT',
    symbol: '৳',
    locale: 'en-BD'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'en-EU'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    locale: 'en-GB'
  }
};

// Default currency for the application
export const DEFAULT_CURRENCY = 'BDT';

/**
 * Format amount with specified currency
 * @param amount - The amount to format
 * @param currencyCode - Currency code (defaults to BDT)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number | undefined | null, 
  currencyCode: string = DEFAULT_CURRENCY
): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
    return `${config.symbol}0`;
  }
  
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format amount with BDT symbol (simplified version)
 * @param amount - The amount to format
 * @returns Formatted BDT string (e.g., "৳1,500")
 */
export const formatBDT = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${SUPPORTED_CURRENCIES.BDT.symbol}0`;
  }
  
  return `${SUPPORTED_CURRENCIES.BDT.symbol}${amount.toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

/**
 * Get currency symbol by code
 * @param currencyCode - Currency code
 * @returns Currency symbol
 */
export const getCurrencySymbol = (currencyCode: string = DEFAULT_CURRENCY): string => {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY].symbol;
};

/**
 * Convert amount between currencies (placeholder for real exchange rates)
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  // Placeholder exchange rates - in real app, fetch from API
  const exchangeRates: Record<string, number> = {
    'USD_BDT': 110, // 1 USD = 110 BDT
    'EUR_BDT': 120, // 1 EUR = 120 BDT
    'GBP_BDT': 140, // 1 GBP = 140 BDT
    'BDT_USD': 1/110,
    'BDT_EUR': 1/120,
    'BDT_GBP': 1/140
  };

  const key = `${fromCurrency}_${toCurrency}`;
  const rate = exchangeRates[key] || 1;
  
  return amount * rate;
};

/**
 * Parse currency string to number
 * @param currencyString - Formatted currency string
 * @param currencyCode - Currency code
 * @returns Parsed number
 */
export const parseCurrency = (
  currencyString: string, 
  currencyCode: string = DEFAULT_CURRENCY
): number => {
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
  
  // Remove currency symbol and parse
  const cleanString = currencyString.replace(config.symbol, '').replace(/,/g, '');
  return parseFloat(cleanString) || 0;
};
